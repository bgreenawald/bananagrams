<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Page not found</p>
    <router-link to="/" class="home-link">Go to Home</router-link>
  </div>
</template>

<style scoped lang="scss">
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;

  h1 {
    font-size: 6rem;
    color: #333;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.5rem;
    color: #666;
    margin-bottom: 2rem;
  }

  .home-link {
    padding: 0.75rem 2rem;
    background-color: #4caf50;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: background-color 0.2s;

    &:hover {
      background-color: #45a049;
    }
  }
}
</style>
