#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("2eCvqnjinuk317YNMTCsUYSEkrN9o79NWrsNHakbFkRj");

#[program]
pub mod demo_day_project {
    use super::*;

  pub fn close(_ctx: Context<CloseDemoDayProject>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.demo_day_project.count = ctx.accounts.demo_day_project.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.demo_day_project.count = ctx.accounts.demo_day_project.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeDemoDayProject>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.demo_day_project.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeDemoDayProject<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + DemoDayProject::INIT_SPACE,
  payer = payer
  )]
  pub demo_day_project: Account<'info, DemoDayProject>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseDemoDayProject<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub demo_day_project: Account<'info, DemoDayProject>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub demo_day_project: Account<'info, DemoDayProject>,
}

#[account]
#[derive(InitSpace)]
pub struct DemoDayProject {
  count: u8,
}
