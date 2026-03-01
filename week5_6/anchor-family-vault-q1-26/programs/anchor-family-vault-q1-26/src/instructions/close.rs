use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

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

        // 2) drain vault -> authority (if balance > 0)
        let amount = self.vault.to_account_info().lamports();
        if amount > 0 {
            let cpi_program = self.system_program.to_account_info();
            let cpi_accounts = Transfer {
                from: self.vault.to_account_info(),
                to: self.vault_authority.to_account_info(),
                    
            };
            let signer_seeds: &[&[&[u8]]] = &[&[
                b"vault", 
                self.vault_state.to_account_info().key.as_ref(), 
                &[self.vault_state.vault_bump]]]; 
            
            let cpi_ctx =CpiContext::new_with_signer(
                cpi_program, 
                cpi_accounts, 
                signer_seeds);
            transfer(cpi_ctx, amount)?;
        }

        // 3) vault_state will be closed automatically (close = vault_authority)
        Ok(())

    }
}