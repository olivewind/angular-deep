setTimeout(() => {
  console.log('app start');
  import('./lazyload')
    .then((m) => {
      console.log(m.hello());
    });
}, 2000);