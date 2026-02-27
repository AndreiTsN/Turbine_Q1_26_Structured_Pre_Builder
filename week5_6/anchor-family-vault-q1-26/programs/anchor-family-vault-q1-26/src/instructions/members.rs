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

    /// The member wallet address we add (does NOT need to sign)
    /// CHECK: only used as a Pubkey for PDA derivation
    pub member: UncheckedAccount<'info>,

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
    require_keys_eq!(
        ctx.accounts.vault_state.vault_authority,
        ctx.accounts.vault_authority.key(),
        VaultError::Unauthorized
    );

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

    /// CHECK: only used for PDA derivation (same as in AddMember)
    pub member: UncheckedAccount<'info>,

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
    require_keys_eq!(
        ctx.accounts.vault_state.vault_authority,
        ctx.accounts.vault_authority.key(),
        VaultError::Unauthorized
    );

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

    /// CHECK: only used for PDA derivation
    pub member: UncheckedAccount<'info>,

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
    require_keys_eq!(
        ctx.accounts.vault_state.vault_authority,
        ctx.accounts.vault_authority.key(),
        VaultError::Unauthorized
    );

    require!(
        ctx.accounts.member_state.frozen,
        VaultError::MemberNotFrozen
    );

    // closing happens automatically via `close = vault_authority`
    Ok(())
}