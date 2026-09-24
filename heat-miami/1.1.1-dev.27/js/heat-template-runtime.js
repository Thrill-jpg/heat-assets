/* =====================================================================
   HEAT TEMPLATE RUNTIME
   Regenerated from September 4, 2026 HEAT MiamiOS v12 live backup.
   Source: Templates.html
   Hosted development build: 1.1.1-dev.26
   ===================================================================== */
(function () {
  "use strict";

  var pageRoute = window.HEAT_PAGE_ROUTE || {};
  var renderedPosting = document.documentElement.classList.contains(
    "heat-route-posting"
  );

  if (
    !pageRoute.isTopic &&
    !pageRoute.isProfile &&
    !pageRoute.isPosting &&
    !renderedPosting
  ) {
    return;
  }

  if (window.HEATSocialInstagramSlider) {
    return;
  }

  window.HEATSocialInstagramSlider = true;

  document.addEventListener("click", function (event) {
    var button = event.target.closest(".hs-carousel-arrow");

    if (!button) {
      return;
    }

    var carousel = button.closest(".hs-carousel");
    var track = carousel && carousel.querySelector(".hs-carousel-track");

    if (!track) {
      return;
    }

    var direction = button.classList.contains("hs-carousel-arrow--prev") ? -1 : 1;
    var distance = Math.max(1, track.clientWidth);

    track.scrollBy({
      left: direction * distance,
      behavior: "smooth"
    });
  });
})();

/* HEAT DEVELOPMENT — Masterlist per-card group colors v1.0 */
(function () {
  "use strict";

  var pageRoute = window.HEAT_PAGE_ROUTE || {};
  var renderedPosting = document.documentElement.classList.contains(
    "heat-route-posting"
  );

  if (
    !pageRoute.isTopic &&
    !pageRoute.isProfile &&
    !pageRoute.isPosting &&
    !renderedPosting
  ) {
    return;
  }

  if (window.HEATMasterlistGroupsV1) return;
  window.HEATMasterlistGroupsV1 = true;

  function validTagName(name) {
    return /^[a-z][a-z0-9-]*$/i.test(name || "");
  }

  function firstValue() {
    for (var i = 0; i < arguments.length; i++) {
      var value = arguments[i];
      if (value && String(value).trim()) return String(value).trim();
    }

    return "";
  }

  function normalizeColorValue(value) {
    return value ? String(value).trim() : "";
  }

  function applyGroup(card) {
    if (!card || card.dataset.hmlReady === "true") return;

    var groupName = (card.getAttribute("data-group") || "")
      .trim()
      .toLowerCase();

    if (!groupName || groupName === "poster") {
      card.dataset.hmlReady = "true";
      return;
    }

    if (!validTagName(groupName)) {
      card.dataset.hmlReady = "true";
      return;
    }

    var probe = document.createElement(groupName);
    probe.textContent = "•";
    probe.style.position = "absolute";
    probe.style.opacity = "0";
    probe.style.pointerEvents = "none";
    probe.style.inset = "0 auto auto 0";
    probe.style.zIndex = "-1";

    document.body.appendChild(probe);

    var computed = window.getComputedStyle(probe);
    var color1 = normalizeColorValue(firstValue(
      computed.getPropertyValue("--heat-group-color-1"),
      computed.getPropertyValue("--heat-template-group-1")
    ));
    var color2 = normalizeColorValue(firstValue(
      computed.getPropertyValue("--heat-group-color-2"),
      computed.getPropertyValue("--heat-template-group-2"),
      color1
    ));
    var color3 = normalizeColorValue(firstValue(
      computed.getPropertyValue("--heat-group-color-3"),
      computed.getPropertyValue("--heat-template-group-3"),
      color2,
      color1
    ));
    var gradient = normalizeColorValue(firstValue(
      computed.getPropertyValue("--heat-group-gradient"),
      computed.getPropertyValue("--heat-template-group-gradient")
    ));
    var textColor = normalizeColorValue(computed.color);

    probe.remove();

    if (!color1 && textColor) color1 = textColor;
    if (!color2 && color1) color2 = color1;
    if (!color3 && color2) color3 = color2;

    if (color1) card.style.setProperty("--hml-card-color-1", color1);
    if (color2) card.style.setProperty("--hml-card-color-2", color2);
    if (color3) card.style.setProperty("--hml-card-color-3", color3);

    if (gradient) {
      card.style.setProperty("--hml-card-gradient", gradient);
    } else if (color1 && color2 && color3) {
      card.style.setProperty(
        "--hml-card-gradient",
        "linear-gradient(120deg," +
          color1 +
          "," +
          color2 +
          " 52%," +
          color3 +
          ")"
      );
    }

    card.dataset.hmlReady = "true";
  }

  function initializeWithin(scope) {
    if (
      !scope ||
      (scope.nodeType !== 1 && scope.nodeType !== 9)
    ) {
      return;
    }

    if (
      scope.nodeType === 1 &&
      scope.matches(".heat-masterlist .hml-card[data-group]")
    ) {
      applyGroup(scope);
    }

    scope
      .querySelectorAll(".heat-masterlist .hml-card[data-group]")
      .forEach(applyGroup);
  }

  function start() {
    var masterlists = document.querySelectorAll(".heat-masterlist");

    if (!masterlists.length) return;

    initializeWithin(document);

    if (!window.MutationObserver) return;

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          initializeWithin(node);
        });
      });
    });
    var observedRoots = [];

    masterlists.forEach(function (masterlist) {
      var root = masterlist.closest(
        ".postcolor, " +
        ".heat-profile-biography-text, " +
        ".heat-profile-connections-field"
      ) || masterlist;

      if (observedRoots.indexOf(root) !== -1) return;

      observedRoots.push(root);
      observer.observe(root, {
        childList: true,
        subtree: true
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();

/* HEAT DEVELOPMENT — Places & Spaces slider v1.0 */
(function () {
  "use strict";

  var pageRoute = window.HEAT_PAGE_ROUTE || {};
  var renderedPosting = document.documentElement.classList.contains(
    "heat-route-posting"
  );

  if (
    !pageRoute.isTopic &&
    !pageRoute.isProfile &&
    !pageRoute.isPosting &&
    !renderedPosting
  ) {
    return;
  }

  if (window.HEATPlaceSlider) return;
  window.HEATPlaceSlider = true;

  document.addEventListener("click", function (event) {
    var button = event.target.closest(".hp-carousel-arrow");
    if (!button) return;

    var carousel = button.closest(".hp-carousel");
    var track = carousel && carousel.querySelector(".hp-carousel-track");
    if (!track) return;

    var direction = button.classList.contains("hp-carousel-arrow--prev") ? -1 : 1;
    var distance = Math.max(1, track.clientWidth);

    track.scrollBy({
      left: direction * distance,
      behavior: "smooth"
    });
  });
})();
