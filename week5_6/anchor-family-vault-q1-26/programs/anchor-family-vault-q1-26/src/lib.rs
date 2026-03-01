use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;

pub use instructions::*;
pub use state::*;
pub use errors::*;


declare_id!("2pNchZcSpEZHJb2A5qT5CdMM87estFMTokhqpbguwKf9");

#[program]
pub mod anchor_family_vault_q1_26 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
       ctx.accounts.initialize(&ctx.bumps)?;
       Ok(())
       
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        ctx.accounts._deposit(amount)?;
        Ok(())
    }

    pub fn add_member(ctx: Context<AddMember>, limit_per_withdraw: u64) -> Result<()> {
        let bump = ctx.bumps.member_state;
        ctx.accounts._add_member(limit_per_withdraw, bump)
    }

    pub fn set_member_frozen(ctx: Context<SetMemberFrozen>, frozen: bool) -> Result<()> {
        ctx.accounts._set_member_frozen(frozen)
    }

    pub fn delete_member(ctx: Context<DeleteMember>) -> Result<()> {
        ctx.accounts._delete_member()
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    ctx.accounts._withdraw(amount)
}

pub fn close_vault(ctx: Context<Close>) -> Result<()> {
    ctx.accounts._close()
}

}

