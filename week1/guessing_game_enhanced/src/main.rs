use std::cmp::Ordering;
use std::io;
use rand::Rng;


fn main() {
    println!("Welcome to the Guess the Number game!");
    println!("Please guess a number between 1 and 100.");
    
    let secret_number = rand::rng().random_range(1..=100);
    let max_attempts = 10;
    let mut attempts_counter = 0;
    
    println!("You have {max_attempts} attempts.");

    while attempts_counter < max_attempts {
        println!("Enter your guess: ");

        let mut guess = String::new();
        io::stdin().read_line(&mut guess).expect("Failed to read line");
        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => {
                println!("Invalid input. Only numbers are allowed.");
                continue;
            }
        };

        attempts_counter += 1;
        println!("Attempt {attempts_counter}. Your guess is {guess}.");

        match guess.cmp(&secret_number) {
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                println!("Congratulations! You guessed the number in {attempts_counter} attempts!");
                println!("Your guess was {guess}. The secret number was {secret_number}.");
                return;
            }
        }
    }
    
    println!("Game over! You've used all {max_attempts} attempts.");
    println!("The secret number was: {secret_number}.");

}

