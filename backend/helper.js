const minifyTryCatch = (func) =>
  func()
    .then((result) => [undefined, result])
    .catch((error) => {
      console.error('An error caught in minifyTryCatch', error.message);
      return [error];
    })

module.exports = {
  minifyTryCatch
}