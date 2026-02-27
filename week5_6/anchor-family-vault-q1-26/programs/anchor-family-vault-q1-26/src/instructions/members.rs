use anchor_lang::prelude::*;

use crate::state::{VaultState, MemberState};
use crate::errors::VaultError;

#[derive(Accounts)]
pub struct AddMember<'info> {
    #[account(mut)]
    pub vault_authority: Signer<'info>,

    #[account(
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
pub fn add_member(ctx: Context<AddMember>, limit_per_withdraw: u64) -> Result<()> {
    let ms = &mut ctx.accounts.member_state;
    ms.vault_state = ctx.accounts.vault_state.key();
    ms.member = ctx.accounts.member.key();
    ms.frozen = false;
    ms.limit_per_withdraw = limit_per_withdraw;
    ms.bump = ctx.bumps.member_state;

    Ok(())
}

#[derive(Accounts)]
pub struct FreezeMember<'info> {
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
        has_one = vault_state @ VaultError::InvalidMemberState,
        has_one = member @ VaultError::InvalidMemberState,
    )]
    pub member_state: Account<'info, MemberState>,
}

pub fn freeze_member(ctx: Context<FreezeMember>, frozen: bool) -> Result<()> {

    ctx.accounts.member_state.frozen = frozen;
    Ok(())
}

#[derive(Accounts)]
pub struct DeleteMember<'info> {
    #[account(mut)]
    pub vault_authority: Signer<'info>,

    #[account(
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
        has_one = vault_state @ VaultError::InvalidMemberState,
        has_one = member @ VaultError::InvalidMemberState,
    )]
    pub member_state: Account<'info, MemberState>,
}

pub fn delete_member(ctx: Context<DeleteMember>) -> Result<()> {
    require!(
        ctx.accounts.member_state.frozen,
        VaultError::MemberNotFrozen
    );

    // closing happens automatically via `close = vault_authority`
    Ok(())
}