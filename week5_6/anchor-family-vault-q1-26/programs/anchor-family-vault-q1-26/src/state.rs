use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct VaultState {
    pub vault_authority: Pubkey,
    pub locked: bool,
    pub vault_bump: u8,
    pub state_bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct MemberState {
    pub vault_state: Pubkey,
    pub member: Pubkey,
    pub frozen: bool,
    pub limit_per_withdraw: u64,
    pub bump: u8,
}