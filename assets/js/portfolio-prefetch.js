(function () {
  var projects = window.portfolioProjects || [];
  var connection = navigator.connection;
  if (connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType))) return;
  var warmed = new Set();
  var heldImages = [];
  var warmTimer;
  function warm(project) {
    if (!project || warmed.has(project.id)) return;
    warmed.add(project.id);
    // Only the selected project's first artwork; never preload long galleries/videos.
    var image = new Image();
    image.decoding = 'async';
    image.fetchPriority = 'low';
    var variant = project.detailResponsive && project.detailResponsive[0];
    image.src = variant ? (window.matchMedia('(max-width:767px)').matches ? variant.mobile : variant.desktop) : ((project.detailImages && project.detailImages[0]) || project.image);
    heldImages.push(image);
    var page = document.createElement('link');
    page.rel = 'prefetch'; page.as = 'document';
    page.href = 'project.html?project=' + project.id + '&v=detail-four-projects-20261028';
    document.head.appendChild(page);
  }
  function intent(event) {
    var card = event.target.closest('.section-team-credits .team-credits-card');
    if (card) {
      var cells = Array.from(card.closest('.flickity-carousel').children);
      clearTimeout(warmTimer);
      var selectedProject = projects[cells.indexOf(card.closest('.flickity-slide'))];
      warmTimer = setTimeout(function () { warm(selectedProject); }, 180);
      return;
    }
    var link = event.target.closest('.case-project-pagination a,#case-next');
    if (link && link.href) {
      var id = new URL(link.href, location.href).searchParams.get('project');
      warm(projects.find(function (p) { return p.id === id; }));
    }
  }
  document.addEventListener('pointerover', intent, {passive: true});
  document.addEventListener('touchstart', intent, {passive: true});
  document.addEventListener('focusin', intent);
  var section = document.querySelector('.section-team-credits');
  if (section && window.IntersectionObserver) {
    var observer = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      var selected = section.querySelector('.flickity-slide.is-selected');
      var cells = Array.from(section.querySelector('.flickity-carousel').children);
      warm(projects[selected ? cells.indexOf(selected) : 0]);
      observer.disconnect();
    }, {rootMargin: '300px'});
    observer.observe(section);
  }
})();
