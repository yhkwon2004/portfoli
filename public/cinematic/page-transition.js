// The opaque curtain covers the DOM swap; native animations remain cancellable.
export function animatePageTransition(loader, page, entering, reduced) {
  if (reduced) return [];
  const timing = {duration: entering ? 420 : 620, easing:'cubic-bezier(.76,0,.24,1)', fill:'both'};
  return [
    loader.animate(entering
      ? [{transform:'translateY(100%)'}, {transform:'translateY(0)'}]
      : [{transform:'translateY(0)'}, {transform:'translateY(-100%)'}], timing),
    loader.querySelector('.loader-center').animate(entering
      ? [{opacity:0, transform:'translateY(80px) scale(.8) rotate(-12deg)'}, {opacity:1, transform:'translateY(0) scale(1) rotate(0deg)'}]
      : [{opacity:1, transform:'translateY(0) scale(1)'}, {opacity:0, transform:'translateY(-70px) scale(1.12)'}], timing),
    page.animate(entering ? [{opacity:1}, {opacity:.35}] : [{opacity:.35}, {opacity:1}], timing)
  ];
}
