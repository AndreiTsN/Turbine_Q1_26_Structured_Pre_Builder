use anchor_lang::prelude::*;

pub const DEFAULT_MAX_MEMBERS: u8 = 3;
pub const DEFAULT_WITHDRAW_LIMIT_LAMPORTS: u64 = 50_000_000; // 0.05 SOL
pub const DEFAULT_WITHDRAW_COOLDOWN_SECONDS: i64 = 5;  // fro demo 5 sec

#[account]
#[derive(InitSpace)]
pub struct VaultState {
    pub vault_authority: Pubkey,
    pub locked: bool,
    pub vault_bump: u8,
    pub state_bump: u8,
    pub members_count: u8,
    pub max_members: u8,
}

#[account]
#[derive(InitSpace)]
pub struct MemberState {
    pub vault_state: Pubkey,
    pub member: Pubkey,
    pub frozen: bool,
    pub limit_per_withdraw: u64,
    pub frozen_until_ts: i64,
    pub bump: u8,
}