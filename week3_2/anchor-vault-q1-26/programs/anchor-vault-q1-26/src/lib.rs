use anchor_lang::prelude::*;

declare_id!("pv4FbaxB6NNvLHJZhAD6p1dWSX77CHjGT1Dm5sUCUS8");

#[program]
pub mod anchor_vault_q1_26 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
