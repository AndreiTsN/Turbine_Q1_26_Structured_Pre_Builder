use anchor_lang::prelude::*;

use crate::state::{VaultState, MemberState};
use crate::errors::VaultError;

#[derive(Accounts)]
pub struct AddMember<'info> {
    #[account(mut)]
    pub vault_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault_state", vault_authority.key().as_ref()],
        bump = vault_state.state_bump,
    )]
    pub vault_state: Account<'info, VaultState>,
    
    pub member: SystemAccount<'info>,   // memeber wallet already exists
 
    #[account(
        init,
        payer = vault_authority,
        space = 8 + MemberState::INIT_SPACE,
        seeds = [b"member", vault_state.key().as_ref(), member.key().as_ref()],
        bump
    )]
    pub member_state: Account<'info, MemberState>,

    pub system_program: Program<'info, System>,
}

impl<'info> AddMember<'info> {
    pub fn _add_member(&mut self, limit_per_withdraw: u64, bump: u8) -> Result<()> {
        require!(
            self.vault_state.members_count < self.vault_state.max_members,
            VaultError::MaxMembersReached
        );

        let member_state = &mut self.member_state;
        member_state.vault_state = self.vault_state.key();
        member_state.member = self.member.key();
        member_state.frozen = false;
        member_state.limit_per_withdraw = limit_per_withdraw;
        member_state.bump = bump;
        member_state.frozen_until_ts = 0;
        self.vault_state.members_count = self.vault_state.members_count.checked_add(1).ok_or(VaultError::MemberCountOverflow)?;
        
        Ok(())
    }
}


#[derive(Accounts)]
pub struct SetMemberFrozen<'info> {
    pub vault_authority: Signer<'info>,

    #[account(
        seeds = [b"vault_state", vault_authority.key().as_ref()],
        bump = vault_state.state_bump,
    )]
    pub vault_state: Account<'info, VaultState>,

    pub member: SystemAccount<'info>,   // memeber wallet already exists

    #[account(
        mut,
        seeds = [b"member", vault_state.key().as_ref(), member.key().as_ref()],
        bump = member_state.bump,
    )]
    pub member_state: Account<'info, MemberState>,
}

impl<'info> SetMemberFrozen<'info> {
    pub fn _set_member_frozen(&mut self,  frozen: bool) -> Result<()> {
        self.member_state.frozen = frozen;
        Ok(())

    }
}


#[derive(Accounts)]
pub struct DeleteMember<'info> {
    #[account(mut)]
    pub vault_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault_state", vault_authority.key().as_ref()],
        bump = vault_state.state_bump,
    )]
    pub vault_state: Account<'info, VaultState>,

    pub member: SystemAccount<'info>,   // memeber wallet already exists

    #[account(
        mut,
        close = vault_authority,
        seeds = [b"member", vault_state.key().as_ref(), member.key().as_ref()],
        bump = member_state.bump,
        
    )]
    pub member_state: Account<'info, MemberState>,
}

impl<'info> DeleteMember<'info> {
    pub fn _delete_member(&mut self) -> Result<()> {

        require!(
            self.member_state.frozen,
            VaultError::MemberNotFrozen
        );

        self.vault_state.members_count = self.vault_state.members_count.checked_sub(1).ok_or(VaultError::MemberCountUnderflow)?;
        

        // closing happens automatically via `close = vault_authority`
        Ok(())
}

}