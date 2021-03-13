# Bananagrams

An online version of the game Bananagrams. The frontend and the backend are seperated in the *frontend* and *backend* directories respectively, so make sure to change into the proper directory before completing the following steps.

## Setup - Backend

This app runs on Python 3 and uses *poetry* to maintain dependencies. Assuming you already have poetry installed and that you are in the *backend* directory, you can simply run

```bash
# 'poetry' must be installed first.

# Install minimal packages needed to run.
poetry install --no-dev

# Install all packages (for testing and development).
poetry install
```

Alternatively, you can use *virtualenv* with the included requirements files. After creating a new virtual environment for the project, run

```bash
# Make sure you have created the virtual environment and are currently in it.

# Install minimal packages needed to run.
pip install -r requirements.txt

# Install all packages (for testing and development).
pip install -r dev-requirements.txt
```

After setting up the environment, just run
```bash
python app.py
```

## Test - Backend
To test the backend, make sure you have the correct virtual environment setup and are in the *backend* directory, and run
```bash
pytest tests/
```

For running the tests the prefered way (multiple cores, verbose output, no warnings), run
```bash
pytest -n 4 -v --disable-warnings tests
```

Or to run coverage, run
```bash
coverage run -m pytest tests/
coverage report
```


## Test - Frontend

TODO