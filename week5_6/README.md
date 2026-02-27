### Family Vault 🏦 

Built as a Capstone for Turbine Pre-Builders (Q1).

Family Vault is a Solana program built with Anchor that allows multiple members to manage shared funds on-chain.

The current version supports native SOL only.
Members can deposit and withdraw funds based on predefined roles and withdrawal limits.

Support for SPL tokens is planned in a future version.

### Architecture (High-Level Flow)

``` initialize ``` — creates the vault and state PDAs and sets the initial vault authority.

``` deposit ``` — transfers SOL from any user to the vault account.

``` members ``` — manages member PDAs (add, freeze, delete, set withdrawal limits) used to validate withdrawals.

``` withdraw ``` — transfers SOL from the vault to an authorized member, enforcing role permissions and withdrawal limits.

``` close ``` — closes the vault and state PDAs, deletes member PDAs, and transfers remaining lamports to the vault authority.