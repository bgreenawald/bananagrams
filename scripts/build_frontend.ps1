# Build the SCSS
sass "static\styles\scss\styles.scss" "static\styles\css\styles.css";
sass "static\styles\scss\game.scss" "static\styles\css\game.css";
sass "static\styles\scss\loading.scss" "static\styles\css\loading.css";

# Compile the Typescript
cd "static\scripts";
webpack;
cd ../..;