/* =====================================================================
   HEAT QUICK PROFILE INSERTS — NOW PLAYING ENHANCEMENT
   REV88
   Progressive enhancement only.
   Native <audio controls> remain functional if this file is not loaded.
   ===================================================================== */

(function () {
    "use strict";

    function formatTime(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) {
            return "0:00";
        }

        var minutes = Math.floor(seconds / 60);
        var remaining = Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");

        return minutes + ":" + remaining;
    }

    function bindPlayer(player) {
        if (!player || player.dataset.heatQuickMusicBound === "true") {
            return;
        }

        var audio = player.querySelector(".heat-profile-quick-music__audio");
        var play = player.querySelector(".heat-profile-quick-music__play");
        var range = player.querySelector(".heat-profile-quick-music__range");
        var time = player.querySelector(".heat-profile-quick-music__time");

        if (!audio || !play || !range || !time) {
            return;
        }

        player.dataset.heatQuickMusicBound = "true";
        player.classList.add("is-enhanced");

        function syncButton() {
            var isPaused = audio.paused;
            play.textContent = isPaused ? "▶" : "❚❚";
            play.setAttribute("aria-label", isPaused ? "Play" : "Pause");
        }

        function syncProgress() {
            if (Number.isFinite(audio.duration) && audio.duration > 0) {
                range.value = String((audio.currentTime / audio.duration) * 100);
            } else {
                range.value = "0";
            }

            time.textContent = formatTime(audio.currentTime);
        }

        play.addEventListener("click", function () {
            if (audio.paused) {
                var promise = audio.play();

                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        syncButton();
                    });
                }
            } else {
                audio.pause();
            }
        });

        range.addEventListener("input", function () {
            if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
                return;
            }

            audio.currentTime =
                (Number(range.value) / 100) * audio.duration;
        });

        audio.addEventListener("play", syncButton);
        audio.addEventListener("pause", syncButton);
        audio.addEventListener("timeupdate", syncProgress);
        audio.addEventListener("loadedmetadata", syncProgress);
        audio.addEventListener("durationchange", syncProgress);

        audio.addEventListener("ended", function () {
            audio.currentTime = 0;
            syncButton();
            syncProgress();
        });

        syncButton();
        syncProgress();
    }

    function run(root) {
        var scope = root && root.querySelectorAll ? root : document;

        if (
            root &&
            root.nodeType === 1 &&
            root.matches &&
            root.matches(".heat-profile-quick--music")
        ) {
            bindPlayer(root);
        }

        scope
            .querySelectorAll(".heat-profile-quick--music")
            .forEach(bindPlayer);
    }

    function boot() {
        run(document);

        if (!window.MutationObserver) {
            return;
        }

        var observer = new MutationObserver(function (records) {
            records.forEach(function (record) {
                record.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1) {
                        run(node);
                    }
                });
            });
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }

    window.HEAT_QUICK_PROFILE_INSERTS = {
        revision: "REV88",
        run: run
    };
})();
