use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};


use crate::errors::VaultError;
use crate::state::{
    VaultState,
    MemberState,
    DEFAULT_WITHDRAW_LIMIT_LAMPORTS,
    DEFAULT_WITHDRAW_COOLDOWN_SECONDS,
};

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub member: Signer<'info>, /// Member who withdraws (must sign)

    #[account(
        seeds = [b"vault_state", vault_state.vault_authority.as_ref()],
        bump = vault_state.state_bump,
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        seeds = [b"vault", vault_state.key().as_ref()],
        bump = vault_state.vault_bump,
    )]
    pub vault: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"member", vault_state.key().as_ref(), member.key().as_ref()],
        bump = member_state.bump,
    )]
    pub member_state: Account<'info, MemberState>,

    pub system_program: Program<'info, System>,
}

impl<'info> Withdraw<'info> {
    pub fn _withdraw(&mut self, amount: u64) -> Result<()> {
        require!(!self.vault_state.locked, VaultError::VaultLocked);  // vault locked?
        require!(!self.member_state.frozen, VaultError::MemberFrozen); //  // member frozen?

        // member cooldown check (demo 5 sce)
        let now = Clock::get()?.unix_timestamp;
        require!(now >= self.member_state.frozen_until_ts, VaultError::MemberInCooldown);

        require!(amount <= DEFAULT_WITHDRAW_LIMIT_LAMPORTS, VaultError::WithdrawLimitExceeded); // member withdraw limit

        // vault balance check
        let vault_lamports = self.vault.to_account_info().lamports();
        require!(vault_lamports >= amount, VaultError::InsufficientVaultBalance);

        // Transfer SOL to member   
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.member.to_account_info(),
        };

        // signer seeds for vault PDA
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"vault", 
            self.vault_state.to_account_info().key.as_ref(),
            &[self.vault_state.vault_bump]]];

        let cpi_ctx = CpiContext::new_with_signer(
            cpi_program, cpi_accounts, signer_seeds);

        transfer(cpi_ctx, amount)?;

        //// set member cooldown after successful withdraw
        self.member_state.frozen_until_ts = now + DEFAULT_WITHDRAW_COOLDOWN_SECONDS; 
        Ok(())

    }
}