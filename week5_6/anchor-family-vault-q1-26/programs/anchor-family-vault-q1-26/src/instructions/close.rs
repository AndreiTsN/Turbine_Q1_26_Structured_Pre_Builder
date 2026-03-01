use anchor_lang::prelude::*;

use crate::errors::VaultError;
use crate::state::VaultState;

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(mut)]
    pub vault_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault_state", vault_authority.key().as_ref()],
        bump = vault_state.state_bump,
        close = vault_authority
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        seeds = [b"vault", vault_state.key().as_ref()],
        bump = vault_state.vault_bump,
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> Close<'info> {
    pub fn _close(&mut self) -> Result<()> {
        // ensure no members left
        require!(self.vault_state.members_count == 0, VaultError::MembersStillExist);

        // ensure vault is empty (no SOL left)
        require!(self.vault.to_account_info().lamports() == 0, VaultError::VaultNotEmpty);

        // closing happens automatically via `close = vault_authority`
        Ok(())
    }
}