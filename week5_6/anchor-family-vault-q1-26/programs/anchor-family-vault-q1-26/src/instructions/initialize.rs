use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, CreateAccount};
use crate::state::VaultState;
use crate::state::DEFAULT_MAX_MEMBERS;


#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub vault_authority: Signer<'info>,

    #[account(
        init,
        payer = vault_authority,
        seeds = [b"vault_state", vault_authority.key().as_ref()],
        bump,
        space = 8 + VaultState::INIT_SPACE,
    )] 
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        seeds =[b"vault", vault_state.key().as_ref() ],
        bump,
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,

}

impl<'info> Initialize<'info> {
    pub fn initialize(&mut self, bumps: &InitializeBumps) -> Result<()> {
        
        let space: u64 = 0;
        let rent_exempt = Rent::get()?.minimum_balance(space as usize);

        let cpi_program = self.system_program.to_account_info();

        let cpi_accounts = CreateAccount {
            from: self.vault_authority.to_account_info(),
            to: self.vault.to_account_info(),
        };
        
        let vault_state =  self.vault_state.key();
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"vault", 
            vault_state.as_ref(),
            &[bumps.vault],
        ]];


        let cpi_ctx = CpiContext::new_with_signer(
            cpi_program,
            cpi_accounts,
            signer_seeds,
        );

        // create system owned vault account
        system_program::create_account(cpi_ctx, rent_exempt, space, &system_program::ID)?;
 
        // save owner and bump for farther use
        self.vault_state.vault_authority = self.vault_authority.key();
        self.vault_state.locked = false;
        self.vault_state.max_members = DEFAULT_MAX_MEMBERS;
        self.vault_state.members_count = 0;
        self.vault_state.vault_bump = bumps.vault;
        self.vault_state.state_bump = bumps.vault_state;
        Ok(())
    }
}
