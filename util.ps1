function Build-Static {
    sass "static\styles\scss\styles.scss" "static\styles\css\styles.css";
    sass "static\styles\scss\game.scss" "static\styles\css\game.css";
}