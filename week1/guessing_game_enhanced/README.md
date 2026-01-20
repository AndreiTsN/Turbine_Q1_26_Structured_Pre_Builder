# Guessing Game (Enhanced)

This is an enhanced version of the classic **"Guess the Number"** game from  
*The Rust Programming Language* (also known as *The Rust Book*).

Compared to the original example from the book, this project extends the game
with additional functionality and uses the modern `rand` crate API.

---

## Features

### Original Rust Book functionality

- Generates a secret number and asks the user to guess it
- Compares the guess with the secret number and prints:
  - `Too small!`
  - `Too big!`
  - `success message when the number is guessed`

### Enhancements in this version

- **Attempt limit**  
  The player has a maximum of **10 attempts**

- **Attempt counter**  
  Each valid guess prints the current attempt number.
  Invalid input does not consume an attempt.

- **Input validation**  
  Non-numeric input is handled gracefully and does not crash the program

- **Game over logic**  
  If all attempts are used, the game ends and reveals the secret number

---

## rand crate (version 0.9.2)

This project uses:

```toml
rand = "0.9.2"
```

Starting with rand 0.9.x, the recommended API for generating random values
uses a new naming scheme.

Instead of the older approach used in the Rust Book:
```rust
rand::thread_rng().gen_range(1..=100);
```

this project uses the modern API:
```rust
let secret_number = rand::rng().random_range(1..=100);
```

## Requirements

Rust toolchain installed

Rust Edition 2024

Cargo (comes with Rust)

## How to run

Clone the repository and run:
```rust
cargo run
```

## Project structure

src/main.rs — main game logic

Cargo.toml — project configuration and dependencies

## Example output

Welcome to the Guess the Number game!
Please guess a number between 1 and 100.
You have 10 attempts.
Enter your guess:

## License

This project is intended for learning and practice purposes.