# Build the SCSS
sass "static\styles\scss\styles.scss" "static\styles\css\styles.css";
sass "static\styles\scss\game.scss" "static\styles\css\game.css";

# Compile the Typescript
cd "static\scripts";
tsc;
cd ../..;