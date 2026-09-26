/* =====================================================================
   HEAT AFTER-BOARD RUNTIME
   Regenerated from September 4, 2026 HEAT MiamiOS v12 live backup.
   Source: Heat. Miami Skin v12-Full.xml Board Wrapper
   Hosted development build: 1.1.1-dev.27
   ===================================================================== */
(function () {
                        "use strict";

                        const html =
                            document.documentElement;

                        const body =
                            document.body;

                        const nativeBoardStats =
                            document.querySelector(
                                "#heat-boardstats-source"
                            );

                        const actualBoardIndex =
                            Boolean(nativeBoardStats);

                        window.HEAT_IS_BOARD_INDEX =
                            actualBoardIndex;

                        html.classList.toggle(
                            "heat-route-index",
                            actualBoardIndex
                        );

                        html.classList.toggle(
                            "heat-route-index-confirmed",
                            actualBoardIndex
                        );

                        if (body) {
                            body.classList.toggle(
                                "heat-board-index",
                                actualBoardIndex
                            );

                            body.classList.toggle(
                                "heat-board-index-confirmed",
                                actualBoardIndex
                            );
                        }

                        /*
                         * If a POST-rendered screen reached us with an
                         * index-looking URL, identify the actual posting
                         * editor from the rendered board markup.
                         */
                        const postingEditor =
                            document.querySelector(
                                '#innerwrapper textarea[name="Post"], ' +
                                '#innerwrapper textarea[name="post"], ' +
                                '#innerwrapper textarea#Post'
                            );

                        if (
                            !actualBoardIndex &&
                            postingEditor
                        ) {
                            html.classList.add(
                                "heat-route-posting"
                            );

                            if (body) {
                                body.classList.add(
                                    "heat-posting-page"
                                );
                            }

                            /*
                             * The head preflight cannot inspect POST-body
                             * fields. Once the rendered editor proves this is
                             * a posting route, repair the shared route object
                             * too so every later module receives the same
                             * answer instead of the original index-looking
                             * guess.
                             */
                            const previousRoute =
                                window.HEAT_PAGE_ROUTE || {};

                            if (
                                !previousRoute.isPosting ||
                                previousRoute.isIndex
                            ) {
                                window.HEAT_PAGE_ROUTE =
                                    Object.freeze(
                                        Object.assign(
                                            {},
                                            previousRoute,
                                            {
                                                isIndex: false,
                                                isPosting: true
                                            }
                                        )
                                    );
                            }

                            document.dispatchEvent(
                                new CustomEvent(
                                    "heat:route-confirmed",
                                    {
                                        detail: {
                                            isPosting: true
                                        }
                                    }
                                )
                            );
                        }
                    })();

/* =====================================================================
   HEATWAVE STEALTH BACKEND — FORUM 294

   Forum 294 remains readable/postable because the HeatWave webpage uses
   the member's authenticated Jcink session. This module removes ordinary
   discovery paths without touching #heatwave-app or blocking direct access.
   ===================================================================== */
(function initializeHeatWaveStealthBackend() {
    "use strict";

    const backendForumId = "294";
    const machineTopicPattern = /^HEATWAVE\s+\d+\s+\d{10,}$/i;
    const route = window.HEAT_PAGE_ROUTE || {};
    const pageParameters = new URLSearchParams(window.location.search);
    const isBackendForumPage = [
        "showforum",
        "f",
        "forum"
    ].some(function (name) {
        return pageParameters.get(name) === backendForumId;
    });

    function cleanValue(value) {
        return String(value || "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function isBackendHref(rawHref) {
        const href = String(rawHref || "").trim();

        if (!href) {
            return false;
        }

        try {
            const url = new URL(href, window.location.href);

            return [
                "showforum",
                "f",
                "forum"
            ].some(function (name) {
                return url.searchParams.get(name) === backendForumId;
            });
        } catch (error) {
            return /(?:[?&]|^)showforum=294(?:&|$)/i.test(href) ||
                /(?:[?&]|^)(?:f|forum)=294(?:&|$)/i.test(href);
        }
    }

    function isMachineTopicTitle(value) {
        return machineTopicPattern.test(cleanValue(value));
    }

    function topicLinkIn(scope) {
        if (!scope || !scope.querySelectorAll) {
            return null;
        }

        return Array.from(
            scope.querySelectorAll(
                'a[href*="showtopic=" i], ' +
                'a[href*="act=ST" i][href*="t=" i]'
            )
        ).find(function (link) {
            return isMachineTopicTitle(link.textContent);
        }) || null;
    }

    function isBackendTopicRow(row) {
        if (!row || !row.querySelector) {
            return false;
        }

        const forumLink = Array.from(
            row.querySelectorAll('a[href]')
        ).find(function (link) {
            return isBackendHref(link.getAttribute("href"));
        });

        return Boolean(forumLink || topicLinkIn(row));
    }

    function hideElement(element) {
        if (!element || element.closest("#heatwave-app")) {
            return;
        }

        element.hidden = true;
        element.setAttribute("aria-hidden", "true");
        element.setAttribute("data-heat-stealth-backend", "294");
    }

    function hideForumDirectoryEntries() {
        document
            .querySelectorAll(
                ".heat-main-forum-card, " +
                ".heat-subforum-directory-card"
            )
            .forEach(function (card) {
                const destinationLink =
                    card.querySelector(
                        ".heat-forum-title a[href]"
                    );

                if (
                    destinationLink &&
                    isBackendHref(
                        destinationLink.getAttribute("href")
                    )
                ) {
                    hideElement(card);
                }
            });

        document
            .querySelectorAll(
                '.heat-forum-v2-subforums a[href], ' +
                '.heat-subforum-directory-card a[href]'
            )
            .forEach(function (link) {
                if (isBackendHref(link.getAttribute("href"))) {
                    hideElement(link);
                }
            });

        document
            .querySelectorAll("select option")
            .forEach(function (option) {
                const value = String(option.value || "").trim();

                if (
                    value === backendForumId ||
                    isBackendHref(value)
                ) {
                    option.remove();
                }
            });

        document
            .querySelectorAll(".heat-category")
            .forEach(function (category) {
                const cards = Array.from(
                    category.querySelectorAll(
                        ".heat-main-forum-card"
                    )
                );

                if (
                    cards.length &&
                    cards.every(function (card) {
                        return card.hidden ||
                            card.dataset.heatStealthBackend === "294";
                    })
                ) {
                    hideElement(category);
                }
            });
    }

    function hideMachineTopicRows() {
        /*
         * A real backend forum/topic page remains readable when members use
         * HeatWave's Records route. Only discovery and activity listings are
         * filtered here.
         */
        if (isBackendForumPage || route.isTopic) {
            return;
        }

        document
            .querySelectorAll(
                'a[href*="showtopic=" i], ' +
                'a[href*="act=ST" i][href*="t=" i]'
            )
            .forEach(function (link) {
                if (!isMachineTopicTitle(link.textContent)) {
                    return;
                }

                const row = link.closest(
                    ".heat-recent-topic-item, " +
                    ".heat-topic-row, " +
                    ".topic-row, " +
                    ".heat-profile-activity-list > div, " +
                    "tr, li"
                );

                hideElement(row || link);
            });
    }

    window.HEAT_STEALTH_BACKEND = Object.freeze({
        forumId: backendForumId,
        isBackendHref: isBackendHref,
        isMachineTopicTitle: isMachineTopicTitle,
        isBackendTopicRow: isBackendTopicRow
    });

    hideForumDirectoryEntries();
    hideMachineTopicRows();
})();

(function () {
                        "use strict";

                        var pageRoute =
                            window.HEAT_PAGE_ROUTE || {};

                        /*
                         * Cleanup Pass 2: structural member-template cleanup
                         * is relevant only where post/profile content can be
                         * rendered or previewed. Board Index, forum lists,
                         * member lists and account utilities skip the selector
                         * catalog, static scan and observer setup completely.
                         */
                        if (
                            !pageRoute.isTopic &&
                            !pageRoute.isProfile &&
                            !pageRoute.isPosting
                        ) {
                            return;
                        }

                        var structuralSelectors = [
    /* Social */
    '.heat-social .hs-carousel-track',
    '.heat-social .hs-comment-meta',
    '.heat-social .hs-comment-row',
    '.heat-social .hs-dm-body',
    '.heat-social .hs-dm-composer',
    '.heat-social .hs-dm-head',
    '.heat-social .hs-ig-grid',
    '.heat-social .hs-ig-highlights',
    '.heat-social .hs-ig-profile__stats',
    '.heat-social .hs-ig-profile__top',
    '.heat-social .hs-notify-head',
    '.heat-social .hs-notify-row',
    '.heat-social .hs-post-actions',
    '.heat-social .hs-post-head',
    '.heat-social .hs-td-actions',
    '.heat-social .hs-td-card__meta',
    '.heat-social .hs-td-card__name',
    '.heat-social .hs-td-chat__body',
    '.heat-social .hs-td-chat__composer',
    '.heat-social .hs-td-chat__head',
    '.heat-social .hs-td-interests',
    '.heat-social .hs-td-list__head',
    '.heat-social .hs-td-list__row',
    '.heat-social .hs-td-match__avatars',
    '.heat-social .hs-td-match__buttons',
    '.heat-social .hs-x-actions',
    '.heat-social .hs-x-dm__body',
    '.heat-social .hs-x-dm__composer',
    '.heat-social .hs-x-dm__head',
    '.heat-social .hs-x-dm__row',
    '.heat-social .hs-x-media-grid',
    '.heat-social .hs-x-notify',
    '.heat-social .hs-x-profile__meta',
    '.heat-social .hs-x-profile__stats',
    '.heat-social .hs-x-profile__topline',
    '.heat-social .hs-x-quote__head',
    '.heat-social .hs-x-tweet',
    '.heat-social .hs-x-tweet__head',

    /* Profile inserts */
    '.heat-profile-insert .heat-profile-insert__windowbar',
    '.heat-profile-insert .heat-profile-insert__dots',
    '.heat-profile-insert .heat-profile-insert__body',
    '.heat-profile-insert .heat-profile-insert__media',
    '.heat-profile-insert .heat-profile-insert__copy',
    '.heat-profile-insert .heat-profile-insert__tags',
    '.heat-profile-insert .heat-insert-bio__layout',
    '.heat-profile-insert .heat-insert-currently__grid',
    '.heat-profile-insert .heat-insert-currently__header',
    '.heat-profile-insert .heat-insert-currently__icon',
    '.heat-profile-insert .heat-insert-currently__item',
    '.heat-profile-insert .heat-insert-moodboard__fact',
    '.heat-profile-insert .heat-insert-moodboard__grid',
    '.heat-profile-insert .heat-insert-moodboard__heading',
    '.heat-profile-insert .heat-insert-moodboard__lower',
    '.heat-profile-insert .heat-insert-writing__masthead',
    '.heat-profile-insert .heat-insert-writing__prose',
    '.heat-profile-insert .heat-insert-writing__section',
    '.heat-profile-insert .heat-insert-writing__section-head',
    '.heat-profile-insert .heat-insert-writing__quote',
    '.heat-profile-insert .heat-insert-chapters__list',
    '.heat-profile-insert .heat-insert-chapter',
    '.heat-profile-insert .heat-insert-chapter__head',
    '.heat-profile-insert .heat-insert-manifesto__statements',
    '.heat-profile-insert .heat-insert-manifesto__statement',
    '.heat-profile-insert .heat-insert-connections__intro',
    '.heat-profile-insert .heat-insert-connections__list',
    '.heat-profile-insert .heat-connection',
    '.heat-profile-insert .heat-connection__media',
    '.heat-profile-insert .heat-connection__copy',
    '.heat-profile-insert .heat-connection__heading',
    '.heat-profile-insert .heat-connection__meta',

    /* Requests */
    '.heat-request .hr-topbar',
    '.heat-request .hr-window-dots',
    '.heat-request .hr-meta',
    '.heat-request .hr-hero',
    '.heat-request .hr-details',
    '.heat-request .hr-suggestion-list',
    '.heat-request .hr-suggestion',
    '.heat-request .hr-role-list',
    '.heat-request .hr-role',
    '.heat-request .hr-plot-grid',
    '.heat-request .hr-cast',
    '.heat-request .hr-compact',

    /* Masterlist / directory */
    '.heat-masterlist .hml-topbar',
    '.heat-masterlist .hml-dots',
    '.heat-masterlist .hml-shell',
    '.heat-masterlist .hml-hero',
    '.heat-masterlist .hml-hero-side',
    '.heat-masterlist .hml-section-head',
    '.heat-masterlist .hml-list',
    '.heat-masterlist .hml-cardbar',
    '.heat-masterlist .hml-cardinner',
    '.heat-masterlist .hml-cardhead',
    '.heat-masterlist .hml-meta',
    '.heat-masterlist .hml-links',
    '.heat-masterlist .hml-footer',

    /* Phone / camera roll / lock / messages */
    '.hd-appbar',
    '.hd-appbar__actions',
    '.hd-checklist',
    '.hd-dump-grid',
    '.hd-dump-hero',
    '.hd-dump-photos',
    '.hd-lock-actions',
    '.hd-lock-summary',
    '.hd-message',
    '.hd-message-composer',
    '.hd-message-contact',
    '.hd-message-photo-grid',
    '.hd-message-thread',
    '.hd-note-tags',
    '.hd-notification',
    '.hd-notification__actions',
    '.hd-notifications',
    '.hd-now-playing',
    '.hd-recents-diary',
    '.hd-recents-duo',
    '.hd-recents-grid',
    '.hd-recents-meta',
    '.hd-status-icons',
    '.hd-statusbar',
    '.hd-voice',
    '.hd-widget__head',

    /* Gallery */
    '.hg-feature__side',
    '.hg-focus__meta',
    '.hg-focus__stage',
    '.hg-nine__foot',
    '.hg-nine__grid',
    '.hg-nine__head',
    '.hg-editorial__title',

    /* Audio */
    '.heat-audio--now',
    '.heat-audio--vinyl',
    '.ha-feature__bottom',
    '.ha-playlist__head',
    '.ha-recent__grid',
    '.ha-recent__head',
    '.ha-song__controls',
    '.ha-song__time',
    '.ha-song__top',
    '.ha-track',
    '.ha-vinyl__controls',

    /* Comments / notifications / admin */
    '.hp-comment__actions',
    '.hp-comment__top',
    '.hp-lock__app',
    '.hp-lock__head',
    '.hp-mention__meta',
    '.hp-pinned__author',
    '.hp-repost__user',
    '.hp-toast__bar',
    '.hp-toast__body',
    '.haw-actions',
    '.haw-bar',
    '.haw-dots',
    '.haw-event-details',
    '.haw-foot',
    '.haw-micro-row',
    '.haw-priority-line',

    /* Comms / calls / FaceTime */
    '.heat-comm-actions',
    '.heat-comm-composer',
    '.heat-comm-contact',
    '.heat-comm-header',
    '.heat-comm-main',
    '.heat-comm-message',
    '.heat-call-contact',
    '.heat-call-controls',
    '.heat-call-topbar',
    '.heat-facetime-app',
    '.heat-facetime-controls',
    '.heat-facetime-status',
    '.heat-facetime-topbar',
    '.heat-traditional-composer',
    '.heat-traditional-contact',
    '.heat-traditional-messages',
    '.heat-traditional-topbar',

    /* Thread templates */
    '.destiny-findbar',
    '.destiny-menubar',
    '.destiny-photo-footer',
    '.destiny-photo-titlebar',
    '.destiny-preview-footer',
    '.destiny-preview-layout',
    '.destiny-preview-pane',
    '.destiny-preview-topbar',
    '.destiny-statusbar',
    '.destiny-title-actions',
    '.destiny-titlebar',
    '.destiny-toolbar',
    '.destiny-window-buttons',
    '.signal-player-main',
    '.signal-recipient',
    '.signal-titlebar',
    '.signal-transcript-header',
    '.signal-transmission',
    '.signal-waveform',
    '.signal-window-buttons',
    '.terminal-active-command',
    '.terminal-command',
    '.terminal-file-header',
    '.terminal-metadata',
    '.terminal-output-header',
    '.terminal-titlebar',
    '.terminal-window-buttons',
    '.airdrop-file-card',
    '.airdrop-file-details',
    '.airdrop-message-header',
    '.airdrop-progress-meta',
    '.airdrop-recipient-strip',
    '.airdrop-statusbar',
    '.airdrop-titlebar',
    '.airdrop-transfer-layout',
    '.airdrop-window-buttons',
    '.canvas-footer',
    '.canvas-gallery-section',
    '.canvas-header',
    '.canvas-media-section',
    '.canvas-side-layout',
    '.momentum-media',

    /* HEAT utility labels */
    '.heat-template-title',
    '.heat-template-label'
                        ];

                        var selector =
                            structuralSelectors.join(",");

                        /*
                         * Text-bearing profile-insert elements need a more
                         * conservative rule. Jcink can inject a BR at the
                         * beginning/end simply because the member formatted
                         * the HTML source across readable lines. Strip only
                         * those formatting edges and preserve any intentional
                         * BR that remains inside the actual prose.
                         */
                        var edgeFormattingSelectors = [
                            '.heat-profile-insert .heat-profile-insert__copy p',
                            '.heat-profile-insert .heat-insert-writing__prose p',
                            '.heat-profile-insert .heat-insert-writing__quote p',
                            '.heat-profile-insert .heat-connection__description'
                        ];

                        var edgeSelector =
                            edgeFormattingSelectors.join(",");

                        function isFormattingText(node) {
                            if (
                                !node ||
                                node.nodeType !== 3
                            ) {
                                return false;
                            }

                            return /^[\s\u00A0\u2007\u202F\u200B\u200C\u200D\uFEFF]*$/
                                .test(
                                    node.nodeValue || ""
                                );
                        }

                        function cleanContainer(container) {
                            if (
                                !container ||
                                container.nodeType !== 1
                            ) {
                                return;
                            }

                            var child =
                                container.firstChild;

                            while (child) {
                                var next =
                                    child.nextSibling;

                                if (
                                    child.nodeType === 1 &&
                                    child.tagName === "BR"
                                ) {
                                    child.remove();
                                } else if (
                                    isFormattingText(child)
                                ) {
                                    child.remove();
                                }

                                child = next;
                            }
                        }

                        function trimFormattingEdges(container) {
                            if (
                                !container ||
                                container.nodeType !== 1
                            ) {
                                return;
                            }

                            function isFormattingEdge(node) {
                                return (
                                    isFormattingText(node) ||
                                    (
                                        node &&
                                        node.nodeType === 1 &&
                                        node.tagName === "BR"
                                    )
                                );
                            }

                            while (
                                container.firstChild &&
                                isFormattingEdge(
                                    container.firstChild
                                )
                            ) {
                                container.firstChild.remove();
                            }

                            while (
                                container.lastChild &&
                                isFormattingEdge(
                                    container.lastChild
                                )
                            ) {
                                container.lastChild.remove();
                            }
                        }

                        function cleanWithin(root) {
                            if (!root) {
                                return;
                            }

                            if (
                                root.nodeType === 1 &&
                                root.matches &&
                                root.matches(selector)
                            ) {
                                cleanContainer(root);
                            }

                            if (
                                root.nodeType === 1 &&
                                root.matches &&
                                root.matches(edgeSelector)
                            ) {
                                trimFormattingEdges(root);
                            }

                            if (root.querySelectorAll) {
                                var containers =
                                    root.querySelectorAll(
                                        selector
                                    );

                                for (
                                    var i = 0;
                                    i < containers.length;
                                    i++
                                ) {
                                    cleanContainer(
                                        containers[i]
                                    );
                                }

                                var edgeContainers =
                                    root.querySelectorAll(
                                        edgeSelector
                                    );

                                for (
                                    var j = 0;
                                    j < edgeContainers.length;
                                    j++
                                ) {
                                    trimFormattingEdges(
                                        edgeContainers[j]
                                    );
                                }
                            }
                        }

                        var root =
                            document.getElementById(
                                "heat-main"
                            );

                        if (!root) {
                            return;
                        }

                        /*
                         * One authoritative static pass after Jcink has
                         * emitted the current board output. This preserves
                         * the approved whitespace/NBSP compatibility fix.
                         */
                        cleanWithin(root);

                        /*
                         * Dynamic compatibility is needed in two narrowly
                         * scoped places:
                         *
                         * 1. Jcink can replace member post HTML in place
                         *    during Quick Edit.
                         * 2. Main Profile reparses escaped field 26/27 source
                         *    after this static sanitizer pass. That replacement
                         *    can reintroduce Jcink-generated BR/whitespace nodes
                         *    into profile-insert grid/flex structure.
                         *
                         * Observe only those known roots. Do NOT restore the
                         * old sitewide #heat-main mutation watch.
                         */
                        if (!window.MutationObserver) {
                            return;
                        }

                        var dynamicRoots =
                            root.querySelectorAll(
                                [
                                    "article.heat-post-row .postcolor",
                                    ".heat-post-copy .postcolor",
                                    ".postcolor[id^='pid_']",
                                    ".heat-profile-biography-text",
                                    ".heat-profile-connections-field"
                                ].join(",")
                            );

                        if (!dynamicRoots.length) {
                            return;
                        }

                        var observer =
                            new MutationObserver(
                                function (mutations) {
                                    for (
                                        var i = 0;
                                        i < mutations.length;
                                        i++
                                    ) {
                                        var mutation =
                                            mutations[i];

                                        if (
                                            mutation.target &&
                                            mutation.target.nodeType === 1 &&
                                            mutation.target.matches
                                        ) {
                                            if (
                                                mutation.target.matches(
                                                    selector
                                                )
                                            ) {
                                                cleanContainer(
                                                    mutation.target
                                                );
                                            }

                                            if (
                                                mutation.target.matches(
                                                    edgeSelector
                                                )
                                            ) {
                                                trimFormattingEdges(
                                                    mutation.target
                                                );
                                            }
                                        }

                                        var added =
                                            mutation.addedNodes;

                                        for (
                                            var j = 0;
                                            j < added.length;
                                            j++
                                        ) {
                                            cleanWithin(
                                                added[j]
                                            );
                                        }
                                    }
                                }
                            );

                        for (
                            var i = 0;
                            i < dynamicRoots.length;
                            i++
                        ) {
                            observer.observe(
                                dynamicRoots[i],
                                {
                                    childList: true,
                                    subtree: true
                                }
                            );
                        }
                    })();

(function () {
                        "use strict";

                        const route = window.HEAT_PAGE_ROUTE;

                        if (!route || !route.isTopic) {
                            return;
                        }

                        const topicTitle = document.querySelector(
                            "#innerwrapper .maintitle .topic-title"
                        );

                        if (
                            !topicTitle ||
                            topicTitle.querySelector(
                                ".heat-thread-heading-description"
                            )
                        ) {
                            return;
                        }

                        function normalize(value) {
                            return String(value || "")
                                .replace(/\s+/g, " ")
                                .trim();
                        }

                        function documentTopicTitle() {
                            const title = normalize(document.title);

                            if (!title) {
                                return "";
                            }

                            const parts = title.split(/\s*->\s*/);

                            return normalize(
                                parts[parts.length - 1]
                            );
                        }

                        const walker = document.createTreeWalker(
                            topicTitle,
                            NodeFilter.SHOW_TEXT
                        );

                        let textNode = null;

                        while (walker.nextNode()) {
                            if (normalize(walker.currentNode.nodeValue)) {
                                textNode = walker.currentNode;
                                break;
                            }
                        }

                        if (!textNode) {
                            return;
                        }

                        const raw = textNode.nodeValue || "";
                        const leadingMatch = raw.match(/^\s*/);
                        const leadingLength = leadingMatch
                            ? leadingMatch[0].length
                            : 0;

                        const visibleText = raw.slice(leadingLength);
                        const nativeTitle = documentTopicTitle();

                        let splitIndex = -1;

                        if (
                            nativeTitle &&
                            visibleText
                                .toLowerCase()
                                .startsWith(nativeTitle.toLowerCase())
                        ) {
                            const remainderStart =
                                leadingLength + nativeTitle.length;

                            const remainder =
                                raw.slice(remainderStart);

                            if (
                                /^\s*[,–—:|]\s*\S/.test(remainder)
                            ) {
                                splitIndex = remainderStart;
                            }
                        }

                        /*
                         * Conservative fallback if document.title differs
                         * from the visible topic title.
                         */
                        if (splitIndex < 0) {
                            const commaMatch =
                                raw.match(/^(\s*[^,]+)(,\s*\S.*)$/s);

                            if (commaMatch) {
                                splitIndex =
                                    commaMatch[1].length;
                            }
                        }

                        if (
                            splitIndex <= 0 ||
                            splitIndex >= raw.length
                        ) {
                            return;
                        }

                        const descriptionText =
                            textNode.splitText(splitIndex);

                        const description =
                            document.createElement("span");

                        description.className =
                            "heat-thread-heading-description";

                        descriptionText.replaceWith(description);
                        description.appendChild(descriptionText);
                    })();

if (!(window.HEAT_ACCOUNT_ROUTE && window.HEAT_ACCOUNT_ROUTE.active)) {

/*
 * This script is emitted after the native board markup, so its
 * server-rendered targets already exist. Initialize immediately
 * instead of batching work into DOMContentLoaded.
 */
(function () {

    const originalUserlinks =
        document.querySelector("#userlinks");


/*
 * ---------------------------------------------------------
 * HEAT FIRST-PAINT PASS 6 — NATIVE BREADCRUMB OWNERSHIP
 * ---------------------------------------------------------
 * Jcink's native navigation macro now renders directly inside the
 * faux browser address bar. No post-render cloning, slugging, title
 * parsing, innerHTML reset, or breadcrumb reconstruction is needed.
 */

    /*
     * ---------------------------------------------------------
     * HEAT FIRST-PAINT PASS 7 — NATIVE ACCOUNT LINK OWNERSHIP
     * ---------------------------------------------------------
     *
     * The active profile, User CP, and Messages destinations are
     * already correct in server-rendered HEAT markup:
     * - profile uses the active Jcink member-id macro directly
     * - User CP uses Jcink's stable UserCP route
     * - Messages uses Jcink's stable Msg route
     *
     * Do not rescan #userlinks and rewrite those hrefs after paint.
     *
     * Two pieces intentionally remain runtime-owned:
     * - Logout: Jcink supplies the authenticated logout destination.
     * - Staff tools: Jcink exposes Admin/Mod links only to accounts
     *   that actually have permission to use them.
     * ---------------------------------------------------------
     */

    const nativeUserlinkAnchors =
        originalUserlinks
            ? Array.from(
                originalUserlinks.querySelectorAll("a[href]")
            )
            : [];

    let logoutUrl = "index.php";

    const nativeLogoutLink =
        nativeUserlinkAnchors.find(function (link) {
            const label = String(
                link.textContent || ""
            )
                .replace(/\s+/g, " ")
                .trim()
                .toLowerCase();

            return (
                label.includes("log out") ||
                label.includes("logout")
            );
        });

    if (
        nativeLogoutLink &&
        nativeLogoutLink.getAttribute("href")
    ) {
        logoutUrl =
            nativeLogoutLink.getAttribute("href");
    }

    /*
     * Apply the authenticated destination immediately after reading
     * the native source. This keeps the member-facing logout control
     * correct before the heavier notification helpers run.
     */
    document
        .querySelectorAll(".heat-logout-link")
        .forEach(function (link) {
            link.setAttribute(
                "href",
                logoutUrl
            );
        });


    /*
     * ---------------------------------------------------------
     * NATIVE STAFF CONTROL PANELS
     * ---------------------------------------------------------
     * Jcink only outputs Admin CP and Mod CP links for accounts
     * that can actually use them. Reuse those native links rather
     * than guessing permissions from a group number.
     */

    function initializeHeatStaffTools() {
        const destination =
            document.querySelector(
                "[data-heat-staff-tools]"
            );

        if (!destination || !originalUserlinks) {
            return;
        }

        const sourceLinks =
            nativeUserlinkAnchors;

        const definitions = [
            {
                key: "admin",
                label: "Admin CP",
                icon: "ph-shield-check",
                match: function (link) {
                    const text = String(
                        link.textContent || ""
                    )
                        .replace(/\s+/g, " ")
                        .trim()
                        .toLowerCase();

                    const href = String(
                        link.getAttribute("href") || ""
                    );

                    return (
                        text === "admin cp" ||
                        /(?:^|\/)admin\.php(?:$|[?#])/i.test(
                            href
                        )
                    );
                }
            },
            {
                key: "mod",
                label: "Mod CP",
                icon: "ph-gavel",
                match: function (link) {
                    const text = String(
                        link.textContent || ""
                    )
                        .replace(/\s+/g, " ")
                        .trim()
                        .toLowerCase();

                    const href = String(
                        link.getAttribute("href") || ""
                    );

                    return (
                        text === "mod cp" ||
                        /[?&]act=modcp(?:&|$)/i.test(
                            href
                        )
                    );
                }
            }
        ];

        definitions.forEach(function (definition) {
            const source = sourceLinks.find(
                definition.match
            );

            if (!source) {
                return;
            }

            const href = source.getAttribute("href");
            if (!href) {
                return;
            }

            const button = document.createElement("a");
            button.className =
                "heat-staff-tool heat-staff-tool-" +
                definition.key;
            button.href = href;

            const sourceTarget =
                source.getAttribute("target");

            if (sourceTarget) {
                button.target = sourceTarget;
            }

            if (sourceTarget === "_blank") {
                button.rel = "noopener noreferrer";
            }

            const icon = document.createElement("i");
            icon.className =
                "ph-duotone " + definition.icon;
            icon.setAttribute("aria-hidden", "true");

            const label = document.createElement("span");
            label.textContent = definition.label;

            button.append(icon, label);
            destination.appendChild(button);
        });

        const buttonCount =
            destination.querySelectorAll(
                ".heat-staff-tool"
            ).length;

        if (!buttonCount) {
            return;
        }

        destination.hidden = false;
        destination.classList.toggle(
            "is-single",
            buttonCount === 1
        );
    }


    initializeHeatStaffTools();

/*
 * ---------------------------------------------------------
 * SIDEBAR NOTIFICATIONS — PHASE 7 FIX
 *
 * Alert and message badges are read from the real Jcink pages.
 * Current Alerts/Inbox pages bypass stale cache values.
 * ---------------------------------------------------------
 */

function normalizeHeatText(value) {
    return String(value || "")
        .replace(/\s+/g, " ")
        .trim();
}

function applyHeatNotificationCount(
    selector,
    count
) {
    const safeCount = Math.max(
        0,
        Number.parseInt(count, 10) || 0
    );

    document
        .querySelectorAll(selector)
        .forEach(function (badge) {
            const label = safeCount > 0
                ? (
                    safeCount > 99
                        ? "99+"
                        : String(safeCount)
                )
                : "";

            if (badge.textContent !== label) {
                badge.textContent = label;
            }

            if (safeCount > 0) {
                if (badge.hidden) {
                    badge.hidden = false;
                }

                if (badge.hasAttribute("aria-hidden")) {
                    badge.removeAttribute(
                        "aria-hidden"
                    );
                }
            } else {
                if (!badge.hidden) {
                    badge.hidden = true;
                }

                if (
                    badge.getAttribute("aria-hidden") !==
                    "true"
                ) {
                    badge.setAttribute(
                        "aria-hidden",
                        "true"
                    );
                }
            }
        });
}

function readHeatStoredCount(key, lifetime) {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) {
            return null;
        }

        const stored = JSON.parse(raw);
        if (
            !stored ||
            typeof stored.count !== "number" ||
            Date.now() - stored.savedAt > lifetime
        ) {
            return null;
        }

        return stored.count;
    } catch (error) {
        return null;
    }
}

function saveHeatStoredCount(key, count) {
    try {
        sessionStorage.setItem(
            key,
            JSON.stringify({
                count: Math.max(
                    0,
                    Number.parseInt(count, 10) || 0
                ),
                savedAt: Date.now()
            })
        );
    } catch (error) {
        /* Storage is optional. */
    }
}

/* ---------------------------------------------------------
   PRIVATE MESSAGE COUNT
   --------------------------------------------------------- */

function getHeatMessageCacheIdentity() {
    const browser =
        document.getElementById(
            "heat-browser"
        );

    const memberId =
        browser
            ? String(
                browser.getAttribute(
                    "data-member-id"
                ) || ""
            ).trim()
            : "";

    if (/^\d+$/.test(memberId)) {
        return memberId;
    }

    const accountLabel =
        document.querySelector(
            "#heat-sidebar-character-username"
        );

    const normalizedName =
        normalizeHeatText(
            accountLabel
                ? accountLabel.textContent
                : ""
        )
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    return normalizedName || "guest";
}

const HEAT_MESSAGE_CACHE_KEY =
    "heatUnreadMessageCount:v3:" +
    getHeatMessageCacheIdentity();

const HEAT_MESSAGE_CACHE_LIFETIME =
    60000;

function getHeatMessageRows(sourceDocument) {
    return Array.from(
        sourceDocument.querySelectorAll("tr")
    ).filter(function (row) {
        const messageLink = row.querySelector(
            'a[href*="MSID=" i], ' +
            'a[href*="CODE=03" i]'
        );

        const checkbox = row.querySelector(
            'input[type="checkbox"]'
        );

        const nativeStatus = row.querySelector(
            'td:first-child img[alt="Read Message" i], ' +
            'td:first-child img[title="Read Message" i], ' +
            'td:first-child img[alt="Unread Message" i], ' +
            'td:first-child img[title="Unread Message" i]'
        );

        return Boolean(
            messageLink &&
            checkbox &&
            nativeStatus
        );
    });
}

function heatMessageRowIsUnread(row) {
    return Boolean(
        row.querySelector(
            'td:first-child img[alt="Unread Message" i], ' +
            'td:first-child img[title="Unread Message" i]'
        )
    );
}

function readHeatUnreadMessageCount(sourceDocument) {
    /*
     * Inbox rows are more trustworthy than page-wide text because the
     * rendered HEAT sidebar can contain an older badge number. Reading
     * the rows first prevents that displayed badge from counting itself.
     */
    const messageRows = getHeatMessageRows(
        sourceDocument
    );

    if (messageRows.length) {
        return messageRows.filter(
            heatMessageRowIsUnread
        ).length;
    }

    const pageText = normalizeHeatText(
        sourceDocument.body
            ? sourceDocument.body.textContent
            : ""
    );

    const explicitPatterns = [
        /(\d+)\s+new\s+messages?/i,
        /new\s+messages?\s*\((\d+)\)/i,
        /(?:new\s+)?pms?\s*[:\-]?\s*\(?(\d+)\)?/i
    ];

    for (const pattern of explicitPatterns) {
        const match = pageText.match(pattern);
        if (match && match[1]) {
            return Number.parseInt(match[1], 10) || 0;
        }
    }

    if (
        /no\s+(?:private\s+)?messages?\s+found/i.test(
            pageText
        ) ||
        /your\s+folder\s+is\s+empty/i.test(
            pageText
        )
    ) {
        return 0;
    }

    return null;
}

function currentDocumentIsHeatInbox() {
    const pageRoute =
        window.HEAT_PAGE_ROUTE || {};

    /*
     * Inbox classification reads native message rows and, as a fallback,
     * visible page text. Never perform either whole-document operation on
     * a route that cannot be a Jcink Messages screen.
     */
    if (!pageRoute.isMessages) {
        return false;
    }

    if (pageRoute.messageSection) {
        return pageRoute.messageSection === "inbox";
    }

    if (getHeatMessageRows(document).length) {
        return true;
    }

    const pageText = normalizeHeatText(
        document.body
            ? document.body.textContent
            : ""
    ).toLowerCase();

    return Boolean(
        pageText.includes("jump to folder") &&
        pageText.includes("message title") &&
        pageText.includes("sender")
    );
}

function displayHeatMessageCount(count) {
    applyHeatNotificationCount(
        "[data-heat-message-count]",
        count
    );
}

function readHeatNativeMessageCount() {

    if (!originalUserlinks) {
        return null;
    }

    const textSources = [
        normalizeHeatText(
            originalUserlinks.textContent
        )
    ];

    originalUserlinks
        .querySelectorAll("a")
        .forEach(function (link) {

            const href =
                String(
                    link.getAttribute(
                        "href"
                    ) || ""
                );

            const label =
                normalizeHeatText(
                    link.textContent
                );

            if (
                /act=msg/i.test(href) ||
                /message|messenger|inbox|\bpm\b/i
                    .test(label)
            ) {
                textSources.push(
                    label
                );
            }
        });

    const patterns = [
        /(\d+)\s+new\s+messages?/i,
        /new\s+messages?\s*\((\d+)\)/i,
        /(?:messages?|messenger|inbox)\s*\((\d+)\)/i,
        /(?:new\s+)?pms?\s*[:\-]?\s*\(?(\d+)\)?/i
    ];

    for (const text of textSources) {
        for (const pattern of patterns) {
            const match =
                String(text || "")
                    .match(pattern);

            if (
                match &&
                match[1]
            ) {
                return Math.max(
                    0,
                    Number.parseInt(
                        match[1],
                        10
                    ) || 0
                );
            }
        }
    }

    return null;
}

async function loadHeatMessageCount() {
    const directCount =
        currentDocumentIsHeatInbox()
            ? readHeatUnreadMessageCount(document)
            : null;

    if (directCount !== null) {
        displayHeatMessageCount(directCount);
        saveHeatStoredCount(
            HEAT_MESSAGE_CACHE_KEY,
            directCount
        );
        return directCount;
    }

    /*
     * Jcink already renders the active account's message state in
     * #userlinks on every real page request. Use that native state
     * instead of silently visiting the Inbox in the background.
     */
    const nativeCount =
        readHeatNativeMessageCount();

    if (nativeCount !== null) {
        displayHeatMessageCount(
            nativeCount
        );

        saveHeatStoredCount(
            HEAT_MESSAGE_CACHE_KEY,
            nativeCount
        );

        return nativeCount;
    }

    /*
     * Fall back to the last account-scoped known count only.
     * No authenticated background Inbox request is performed.
     */
    const cachedCount =
        readHeatStoredCount(
            HEAT_MESSAGE_CACHE_KEY,
            HEAT_MESSAGE_CACHE_LIFETIME
        );

    if (cachedCount !== null) {
        displayHeatMessageCount(
            cachedCount
        );
        return cachedCount;
    }

    displayHeatMessageCount(0);
    return 0;
}

/* ---------------------------------------------------------
   NATIVE ALERT COUNT — FIX 7
   --------------------------------------------------------- */

const HEAT_ALERT_CACHE_IDENTITY =
    getHeatMessageCacheIdentity();

const HEAT_ALERT_CACHE_KEY =
    "heatNativeAlertCount:v9:" +
    HEAT_ALERT_CACHE_IDENTITY;

/* Older keys were global across every linked account. Do not migrate them. */
const HEAT_ALERT_LEGACY_KEYS = [];

/*
 * The counter is a local latch. Background checks can acknowledge Jcink's
 * server-side "new alerts" notice, so every newly reported batch is ADDED to
 * the visible total. The total resets only when the real Alerts page is
 * opened. A response signature prevents one batch from being counted twice.
 */
function parseHeatStoredAlertState(raw) {
    if (!raw) {
        return null;
    }

    try {
        const stored = JSON.parse(raw);

        if (
            !stored ||
            typeof stored.count !== "number"
        ) {
            return null;
        }

        return {
            count: Math.max(
                0,
                Number.parseInt(
                    stored.count,
                    10
                ) || 0
            ),
            savedAt:
                Number(stored.savedAt) || 0,
            lastBatchSignature:
                typeof stored.lastBatchSignature ===
                "string"
                    ? stored.lastBatchSignature
                    : ""
        };
    } catch (error) {
        return null;
    }
}

function readHeatStoredAlertState() {
    try {
        const current = parseHeatStoredAlertState(
            localStorage.getItem(
                HEAT_ALERT_CACHE_KEY
            )
        );

        if (current) {
            return current;
        }

        /* Preserve the last visible count when upgrading from FIX 6. */
        for (const legacyKey of HEAT_ALERT_LEGACY_KEYS) {
            const legacy = parseHeatStoredAlertState(
                localStorage.getItem(legacyKey)
            );

            if (legacy) {
                return legacy;
            }
        }
    } catch (error) {
        /* Storage is optional. */
    }

    return {
        count: 0,
        savedAt: 0,
        lastBatchSignature: ""
    };
}

function readHeatStoredAlertCount() {
    return readHeatStoredAlertState().count;
}

function saveHeatStoredAlertState(state) {
    const safeState = state || {};

    try {
        localStorage.setItem(
            HEAT_ALERT_CACHE_KEY,
            JSON.stringify({
                count: Math.max(
                    0,
                    Number.parseInt(
                        safeState.count,
                        10
                    ) || 0
                ),
                savedAt: Date.now(),
                lastBatchSignature:
                    typeof safeState
                        .lastBatchSignature ===
                    "string"
                        ? safeState
                            .lastBatchSignature
                        : ""
            })
        );
    } catch (error) {
        /* Storage is optional. */
    }
}

function parseHeatNativeAlertNumber(value) {
    const text = normalizeHeatText(value);

    if (!text) {
        return null;
    }

    const patterns = [
        /you\s+have\s+(\d+)\s+new\s+alert(?:\(s\)|s)?/i,
        /new\s+alerts?\s*[\(\[{:—\-]?\s*(\d+)/i,
        /alerts?\s*[\(\[{:—\-]?\s*(\d+)/i,
        /(\d+)\s+(?:new\s+)?alerts?/i
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);

        if (match && match[1]) {
            return Math.max(
                0,
                Number.parseInt(
                    match[1],
                    10
                ) || 0
            );
        }
    }

    return null;
}

function readHeatNativeUserlinkAlertCount() {
    if (!originalUserlinks) {
        return null;
    }

    const candidates = Array.from(
        originalUserlinks.querySelectorAll(
            'a[href*="CODE=alerts" i], ' +
            'a[href*="code=alerts" i], ' +
            '[id*="alert" i], ' +
            '[class*="alert" i], ' +
            '[id*="notif" i], ' +
            '[class*="notif" i]'
        )
    );

    for (const node of candidates) {
        const values = [
            node.textContent,
            node.getAttribute("title"),
            node.getAttribute("aria-label"),
            node.getAttribute("data-count"),
            node.getAttribute("data-alert-count"),
            node.getAttribute(
                "data-notification-count"
            )
        ];

        node
            .querySelectorAll(
                '[title], [aria-label], [alt], ' +
                '[data-count], [data-alert-count], ' +
                '[data-notification-count]'
            )
            .forEach(function (child) {
                values.push(
                    child.textContent,
                    child.getAttribute("title"),
                    child.getAttribute("aria-label"),
                    child.getAttribute("alt"),
                    child.getAttribute("data-count"),
                    child.getAttribute(
                        "data-alert-count"
                    ),
                    child.getAttribute(
                        "data-notification-count"
                    )
                );
            });

        for (const value of values) {
            const count =
                parseHeatNativeAlertNumber(
                    value
                );

            if (count !== null) {
                return count;
            }
        }
    }

    return parseHeatNativeAlertNumber(
        normalizeHeatText(
            originalUserlinks.textContent
        )
    );
}

function currentDocumentIsHeatAlerts() {
    /*
     * The alert latch may reset only after the member actually navigates to
     * Jcink's Alerts route. DOM clues such as prune_day also occur on other
     * User CP pages and could incorrectly clear the badge after a refresh.
     */
    return Boolean(
        window.HEAT_PAGE_ROUTE &&
        window.HEAT_PAGE_ROUTE.isAlerts
    );
}

function readHeatAlertCount(sourceDocument) {
    const pageText = normalizeHeatText(
        sourceDocument.body
            ? sourceDocument.body.textContent
            : ""
    );

    /*
     * Jcink's notice is the size of the newly delivered batch. Background
     * checks can acknowledge that batch, so FIX 7 accumulates it locally.
     */
    const numericMatch = pageText.match(
        /you\s+have\s+(\d+)\s+new\s+alert(?:\(s\)|s)?/i
    );

    if (numericMatch) {
        return Math.max(
            0,
            Number.parseInt(
                numericMatch[1],
                10
            ) || 0
        );
    }

    const explicitUnreadRows =
        sourceDocument.querySelectorAll(
            "tr.alert-unread, " +
            "tr.unread-alert, " +
            "tr.new-alert, " +
            "tr[data-alert-unread='true']"
        ).length;

    if (explicitUnreadRows > 0) {
        return explicitUnreadRows;
    }

    if (
        /you\s+have\s+no\s+new\s+alerts?/i.test(
            pageText
        ) ||
        /no\s+alerts?\s+found/i.test(pageText)
    ) {
        return 0;
    }

    return null;
}

function displayHeatAlertCount(count) {
    const safeCount = Math.max(
        0,
        Number.parseInt(count, 10) || 0
    );

    document
        .querySelectorAll(
            "[data-heat-alert-count], " +
            "[data-heat-native-alert-count]"
        )
        .forEach(function (badge) {
            const label = safeCount > 99
                ? "99+"
                : String(safeCount);
            const ariaLabel = safeCount === 1
                ? "1 unread alert"
                : safeCount + " unread alerts";

            if (badge.textContent !== label) {
                badge.textContent = label;
            }

            if (badge.hidden) {
                badge.hidden = false;
            }

            badge.classList.toggle(
                "is-active",
                safeCount > 0
            );
            badge.classList.toggle(
                "is-zero",
                safeCount === 0
            );

            if (
                badge.getAttribute("aria-label") !==
                ariaLabel
            ) {
                badge.setAttribute(
                    "aria-label",
                    ariaLabel
                );
            }
        });
}

function hashHeatAlertSignature(value) {
    const text = String(value || "");
    let hash = 2166136261;

    for (
        let index = 0;
        index < text.length;
        index += 1
    ) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return (hash >>> 0).toString(36);
}

function createHeatAlertBatchSignature(
    sourceDocument,
    count
) {
    const filter = sourceDocument.querySelector(
        'select[name="prune_day"]'
    );

    const panel =
        (filter && filter.closest(".tableborder")) ||
        sourceDocument.body;

    const rows = panel
        ? Array.from(
            panel.querySelectorAll(
                "tr.dlight, " +
                "tr.alert-unread, " +
                "tr.unread-alert, " +
                "tr.new-alert"
            )
        )
        : [];

    const rowData = rows
        .slice(0, 12)
        .map(function (row) {
            const links = Array.from(
                row.querySelectorAll("a[href]")
            )
                .map(function (link) {
                    return link.getAttribute("href") || "";
                })
                .join("|");

            return (
                normalizeHeatText(row.textContent) +
                "|" + links
            );
        })
        .join("||");

    const fallbackText = normalizeHeatText(
        panel ? panel.textContent : ""
    ).slice(0, 5000);

    return hashHeatAlertSignature(
        String(count) +
        "::" +
        (rowData || fallbackText)
    );
}

function resetHeatAlertCount(sourceDocument) {
    /* Never clear the latch from a refresh, classifier, or fetched document. */
    if (!currentDocumentIsHeatAlerts()) {
        const preservedCount =
            readHeatStoredAlertCount();

        displayHeatAlertCount(
            preservedCount
        );

        return preservedCount;
    }

    const pageCount = sourceDocument
        ? readHeatAlertCount(sourceDocument)
        : 0;

    const signature = sourceDocument
        ? createHeatAlertBatchSignature(
            sourceDocument,
            pageCount || 0
        )
        : "";

    saveHeatStoredAlertState({
        count: 0,
        lastBatchSignature: signature
    });
    displayHeatAlertCount(0);

    return 0;
}

function addHeatAlertBatch(
    batchCount,
    sourceDocument
) {
    const safeBatchCount = Math.max(
        0,
        Number.parseInt(batchCount, 10) || 0
    );

    const stored = readHeatStoredAlertState();

    if (safeBatchCount === 0) {
        displayHeatAlertCount(stored.count);
        return stored.count;
    }

    const signature =
        createHeatAlertBatchSignature(
            sourceDocument,
            safeBatchCount
        );

    if (
        signature &&
        signature === stored.lastBatchSignature
    ) {
        displayHeatAlertCount(stored.count);
        return stored.count;
    }

    const nextCount =
        stored.count + safeBatchCount;

    saveHeatStoredAlertState({
        count: nextCount,
        lastBatchSignature: signature
    });
    displayHeatAlertCount(nextCount);

    return nextCount;
}

function loadHeatAlertCount() {
    if (currentDocumentIsHeatAlerts()) {
        return resetHeatAlertCount(document);
    }

    const storedCount =
        readHeatStoredAlertCount();

    const nativeCount =
        readHeatNativeUserlinkAlertCount();

    /*
     * Every real Jcink page load already contains the active account's
     * native alert state. Prefer it when available and preserve the
     * account-scoped latch otherwise.
     *
     * No Alerts/UserCP page is fetched in the background.
     */
    const visibleCount =
        nativeCount !== null
            ? Math.max(
                storedCount,
                nativeCount
            )
            : storedCount;

    if (
        nativeCount !== null &&
        nativeCount > storedCount
    ) {
        saveHeatStoredAlertState({
            count: nativeCount,
            lastBatchSignature:
                readHeatStoredAlertState()
                    .lastBatchSignature
        });
    }

    displayHeatAlertCount(
        visibleCount
    );

    return visibleCount;
}


loadHeatMessageCount();
loadHeatAlertCount();

/*
 * Keep multiple open tabs in visual sync through localStorage.
 * This does not contact Jcink or change presence/location.
 */
window.addEventListener(
    "storage",
    function (event) {
        if (
            event.key !== HEAT_ALERT_CACHE_KEY ||
            !event.newValue
        ) {
            return;
        }

        const stored =
            parseHeatStoredAlertState(
                event.newValue
            );

        if (stored) {
            displayHeatAlertCount(
                stored.count
            );
        }
    }
);


/* Open and close the menu */

const notificationToggle =
    document.querySelector(
        "#heat-sidebar-notification-toggle"
    );

const notificationMenu =
    document.querySelector(
        "#heat-sidebar-notification-menu"
    );

if (
    window.HEAT_EARLY_UI &&
    typeof window.HEAT_EARLY_UI
        .releaseFeature === "function"
) {
    window.HEAT_EARLY_UI.releaseFeature(
        "notifications"
    );
}


function closeSidebarNotifications() {

    if (
        !notificationToggle ||
        !notificationMenu
    ) {
        return;
    }

    notificationToggle.classList.remove(
        "is-open"
    );

    notificationMenu.classList.remove(
        "is-open"
    );

    notificationToggle.setAttribute(
        "aria-expanded",
        "false"
    );
}


if (
    notificationToggle &&
    notificationMenu
) {

    notificationToggle.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            const willOpen =
                !notificationMenu.classList.contains(
                    "is-open"
                );

            notificationToggle.classList.toggle(
                "is-open",
                willOpen
            );

            notificationMenu.classList.toggle(
                "is-open",
                willOpen
            );

            notificationToggle.setAttribute(
                "aria-expanded",
                willOpen
                    ? "true"
                    : "false"
            );
        }
    );


    notificationMenu.addEventListener(
        "click",
        function (event) {
            event.stopPropagation();
        }
    );


    document.addEventListener(
        "click",
        closeSidebarNotifications
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {
                closeSidebarNotifications();
            }
        }
    );
}
    /*
     * ---------------------------------------------------------
     * ACCOUNT DROPDOWN
     * ---------------------------------------------------------
     */

    const accountToggle =
        document.querySelector(
            "#heat-account-toggle"
        );

    const accountDropdown =
        document.querySelector(
            "#heat-account-dropdown"
        );

    if (
        window.HEAT_EARLY_UI &&
        typeof window.HEAT_EARLY_UI
            .releaseFeature === "function"
    ) {
        window.HEAT_EARLY_UI.releaseFeature(
            "account"
        );
    }


    function closeAccountDropdown() {

        if (
            !accountToggle ||
            !accountDropdown
        ) {
            return;
        }

        accountDropdown
            .classList
            .remove("is-open");

        accountToggle
            .setAttribute(
                "aria-expanded",
                "false"
            );

    }


    if (
        accountToggle &&
        accountDropdown
    ) {

        accountToggle
            .addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    const willOpen =
                        !accountDropdown
                            .classList
                            .contains("is-open");

                    accountDropdown
                        .classList
                        .toggle(
                            "is-open",
                            willOpen
                        );

                    accountToggle
                        .setAttribute(
                            "aria-expanded",
                            willOpen
                                ? "true"
                                : "false"
                        );

                }
            );


        accountDropdown
            .addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                }
            );


        document
            .addEventListener(
                "click",
                closeAccountDropdown
            );


        document
            .addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Escape"
                    ) {
                        closeAccountDropdown();
                    }

                }
            );

    }

})();
}

if (!(window.HEAT_ACCOUNT_ROUTE && window.HEAT_ACCOUNT_ROUTE.active)) {

/*
 * This script is emitted after the native board markup, so its
 * server-rendered targets already exist. Initialize immediately
 * instead of batching work into DOMContentLoaded.
 */
(function () {

    const greetingElement =
        document.querySelector(".heat-dashboard-greeting");

    const dateElement =
        document.querySelector(".heat-dashboard-date");

    if (!greetingElement && !dateElement) {
        return;
    }

    const currentDate =
        new Date();

    const currentHour =
        currentDate.getHours();

    let greeting =
        "Good Evening, Miami 🌴";

    if (currentHour >= 5 && currentHour < 12) {
        greeting =
            "Good Morning, Miami ☀️";
    } else if (
        currentHour >= 12 &&
        currentHour < 17
    ) {
        greeting =
            "Good Afternoon, Miami 🌴";
    }

    if (greetingElement) {
        greetingElement.textContent =
            greeting;
    }

    if (dateElement) {

        dateElement.textContent =
            currentDate.toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            );

    }

})();
}

if (!(window.HEAT_ACCOUNT_ROUTE && window.HEAT_ACCOUNT_ROUTE.active)) {

(function initializeHeatSharedBoardData() {
    "use strict";

    /* =========================================================
       HEAT — BOARD INDEX DATA OWNERSHIP

       Recent Topics, Miami Snapshot, and Board Activity are now
       Board Index features only. Non-index pages leave this module
       immediately: no Recent Topics cache work, no /index.php helper
       fetch, no DOMParser pass, and no delayed idle mutation.
       ========================================================= */

    const isBoardIndex =
        Boolean(
            document.querySelector(
                "#heat-boardstats-source"
            )
        );

    if (!isBoardIndex) {
        return;
    }

    const recentTopicsSlot =
        document.querySelector(
            "#heat-sidebar #heat-recent-topics-slot"
        );

    const stealthBackend =
        window.HEAT_STEALTH_BACKEND || null;

    function cleanBoardValue(value) {
        return String(value || "")
            .replace(/\s+/g, " ")
            .trim();
    }


    /* ---------------------------------------------------------
       RECENT TOPICS
       --------------------------------------------------------- */

    function findRecentTopicsPanel(sourceDocument) {

        const innerwrapper =
            sourceDocument.querySelector(
                "#innerwrapper"
            );

        if (!innerwrapper) {
            return null;
        }

        const directPanels =
            Array.from(innerwrapper.children)
                .filter(function (panel) {
                    return panel.matches(
                        ".tableborder, table"
                    );
                });

        return directPanels.find(function (panel) {

            const hasNativeHeading =
                panel.matches(".tableborder")
                    ? Boolean(
                        panel.querySelector(
                            ":scope > .maintitle"
                        )
                    )
                    : Boolean(
                        panel.querySelector(
                            ".maintitle"
                        )
                    );

            if (!hasNativeHeading) {
                return false;
            }

            /*
             * Native Jcink Recent Topic Activity rows expose these
             * dedicated cell classes. Requiring them prevents unrelated
             * tables such as Online Users / Last Click from qualifying
             * merely because their Location column contains showtopic links.
             */
            const nativeRecentRow =
                panel.querySelector(
                    "tr " +
                    "td.recent-topics-info"
                );

            const nativeRecentDate =
                panel.querySelector(
                    "tr " +
                    "td.recent-topics-date"
                );

            if (
                !nativeRecentRow ||
                !nativeRecentDate
            ) {
                return false;
            }

            const hasTopicRows =
                Boolean(
                    nativeRecentRow.querySelector(
                        'a[href*="showtopic="], ' +
                        'a[href*="act=ST"][href*="t="]'
                    )
                );

            if (!hasTopicRows) {
                return false;
            }

            const hasMemberLinks =
                Boolean(
                    nativeRecentRow.querySelector(
                        'a[href*="showuser="], ' +
                        'a[href*="MID="], ' +
                        'a[href*="mid="]'
                    )
                );

            return hasMemberLinks;
        }) || null;
    }


    function cloneRecentTopicNode(node) {

        if (!node) {
            return null;
        }

        const copy = node.cloneNode(true);

        copy.removeAttribute("id");

        copy
            .querySelectorAll("[id]")
            .forEach(function (element) {
                element.removeAttribute("id");
            });

        return copy;
    }


    function findRecentTopicRows(sourcePanel) {

        if (!sourcePanel) {
            return [];
        }

        return Array.from(
            sourcePanel.querySelectorAll(
                "tr"
            )
        ).filter(function (row) {

            const infoCell =
                row.querySelector(
                    ":scope > " +
                    "td.recent-topics-info"
                );

            const dateCell =
                row.querySelector(
                    ":scope > " +
                    "td.recent-topics-date"
                );

            if (
                !infoCell ||
                !dateCell
            ) {
                return false;
            }

            if (
                stealthBackend &&
                stealthBackend.isBackendTopicRow(row)
            ) {
                return false;
            }

            return Boolean(
                infoCell.querySelector(
                    'a[href*="showtopic="], ' +
                    'a[href*="act=ST"][href*="t="]'
                )
            );
        });
    }


    function buildRecentTopicItem(sourceRow) {

        if (
            stealthBackend &&
            stealthBackend.isBackendTopicRow(sourceRow)
        ) {
            return null;
        }

        const links = Array.from(
            sourceRow.querySelectorAll("a[href]")
        );

        const topicLink =
            links.find(function (link) {
                const href = String(
                    link.getAttribute("href") || ""
                );

                return (
                    href.includes("showtopic=") ||
                    (
                        /[?&]act=ST(?:&|$)/i.test(href) &&
                        /[?&]t=\d+/i.test(href)
                    )
                );
            });

        if (!topicLink) {
            return null;
        }

        const authorLink =
            links.find(function (link) {
                if (link === topicLink) {
                    return false;
                }

                const href = String(
                    link.getAttribute("href") || ""
                );

                return /showuser=|[?&](?:MID|mid)=/i.test(
                    href
                );
            }) || null;

        const cells = Array.from(
            sourceRow.querySelectorAll("td")
        );

        const item = document.createElement("article");
        item.className = "heat-recent-topic-item";

        const copy = document.createElement("div");
        copy.className = "heat-recent-topic-copy";

        const topicCopy = cloneRecentTopicNode(
            topicLink
        );

        topicCopy.classList.add(
            "heat-recent-topic-title"
        );

        const author = document.createElement("div");
        author.className = "heat-recent-topic-author";

        if (authorLink) {
            const authorCopy = cloneRecentTopicNode(
                authorLink
            );

            author.appendChild(authorCopy);
        } else {
            const rowText = cleanBoardValue(
                cells[0]
                    ? cells[0].textContent
                    : sourceRow.textContent
            );

            const authorMatch = rowText.match(
                /(?:^|\s)-?\s*by\s+(.+)$/i
            );

            author.textContent = authorMatch
                ? authorMatch[1]
                : "";
        }

        copy.appendChild(topicCopy);

        if (cleanBoardValue(author.textContent)) {
            copy.appendChild(author);
        }

        item.append(copy);

        return item;
    }


    function placeRecentTopics(sourcePanel) {

        if (!recentTopicsSlot || !sourcePanel) {
            return false;
        }

        const sourceRows = findRecentTopicRows(
            sourcePanel
        );

        const list = document.createElement("div");
        list.className = "heat-recent-topic-list";

        sourceRows.forEach(function (sourceRow) {
            const item = buildRecentTopicItem(sourceRow);

            if (item) {
                list.appendChild(item);
            }
        });

        if (!list.childElementCount) {
            const empty = document.createElement("div");
            empty.className = "heat-widget-loading";
            empty.textContent = "No recent topics yet.";
            recentTopicsSlot.replaceChildren(empty);
            recentTopicsSlot.classList.remove("is-loading");
            recentTopicsSlot.setAttribute("aria-busy", "false");
            return true;
        }

        recentTopicsSlot.replaceChildren(list);
        recentTopicsSlot.classList.remove("is-loading");
        recentTopicsSlot.setAttribute(
            "aria-busy",
            "false"
        );

        /*
         * Keep Jcink's native panel in place as the authoritative
         * board-index data source. Its first-paint visibility is owned
         * by the dedicated structural CSS contract.
         */
        return true;
    }


    function loadRecentTopics() {

        if (!recentTopicsSlot) {
            return;
        }

        const currentPanel =
            findRecentTopicsPanel(document);

        if (
            currentPanel &&
            !recentTopicsSlot.contains(currentPanel) &&
            placeRecentTopics(currentPanel)
        ) {
            return;
        }

        recentTopicsSlot.classList.remove(
            "is-loading"
        );
        recentTopicsSlot.setAttribute(
            "aria-busy",
            "false"
        );
        recentTopicsSlot.innerHTML =
            '<div class="heat-widget-loading">' +
            "Recent topics are unavailable right now." +
            "</div>";
    }


    /* ---------------------------------------------------------
       MIAMI SNAPSHOT + BOARD ACTIVITY
       --------------------------------------------------------- */

    function copyBoardValue(
        source,
        sourceName,
        targetSelector
    ) {
        const sourceElement =
            source.querySelector(
                '[data-heat-source="' +
                    sourceName +
                '"]'
            );

        if (!sourceElement) {
            return;
        }

        const value = cleanBoardValue(
            sourceElement.textContent
        );

        if (!value) {
            return;
        }

        document
            .querySelectorAll(targetSelector)
            .forEach(function (target) {
                target.textContent = value;
            });
    }


    function populateOnlineTodayList(source) {

        const sourceList =
            source.querySelector(
                '[data-heat-source="online-today-list"]'
            );

        const targetList =
            document.querySelector(
                "#heat-sidebar [data-heat-online-today-list]"
            );

        if (!sourceList || !targetList) {
            return;
        }

        /*
         * Render member names only.
         *
         * Jcink separates its native list with punctuation/text nodes.
         * Copying the entire source produced pill-like names mixed with
         * visible dots. We now preserve only real profile links, including
         * their native group classes and profile URLs.
         */
        const sourceLinks =
            Array.from(
                sourceList.querySelectorAll(
                    'a[href*="showuser="], ' +
                    'a[href*="MID="], ' +
                    'a[href*="mid="]'
                )
            );

        const fragment =
            document.createDocumentFragment();

        sourceLinks.forEach(function (sourceLink) {

            const memberName =
                cleanBoardValue(
                    sourceLink.textContent
                );

            if (!memberName) {
                return;
            }

            const linkCopy =
                sourceLink.cloneNode(true);

            linkCopy.removeAttribute("id");

            linkCopy
                .querySelectorAll("[id]")
                .forEach(function (element) {
                    element.removeAttribute("id");
                });

            /*
             * Keep Jcink's native group wrapper intact. ACP group
             * prefixes often live on a child span rather than the
             * anchor itself. Flattening the link to plain text erased
             * that native identity and forced a JavaScript profile
             * lookup later. Remove only non-name decoration instead.
             */
            linkCopy
                .querySelectorAll(
                    "img, script, style, .heat-compact-gif-layer"
                )
                .forEach(function (node) {
                    node.remove();
                });

            linkCopy.removeAttribute("title");

            fragment.appendChild(
                linkCopy
            );
        });

        if (!fragment.childNodes.length) {
            targetList.textContent =
                "No recorded activity yet.";
            return;
        }

        targetList.replaceChildren(fragment);

        /* Native ACP/Jcink group markup is preserved above. */
    }


    function populateNewestMember(source) {

        const newestMemberSource =
            source.querySelector(
                '[data-heat-source="newest-member"]'
            );

        const newestMemberTarget =
            document.querySelector(
                "#heat-sidebar " +
                "[data-heat-newest-member]"
            );

        if (
            !newestMemberSource ||
            !newestMemberTarget
        ) {
            return;
        }

        const newestMemberLink =
            newestMemberSource.querySelector("a");

        if (newestMemberLink) {
            const memberLinkCopy =
                newestMemberLink.cloneNode(true);

            memberLinkCopy.removeAttribute("id");

            newestMemberTarget.replaceChildren(
                memberLinkCopy
            );
            newestMemberTarget.classList.add(
                "is-ready"
            );
            newestMemberTarget.setAttribute(
                "aria-busy",
                "false"
            );
            return;
        }

        const memberName =
            cleanBoardValue(
                newestMemberSource.textContent
            );

        if (memberName) {
            newestMemberTarget.textContent =
                memberName;
            newestMemberTarget.classList.add(
                "is-ready"
            );
            newestMemberTarget.setAttribute(
                "aria-busy",
                "false"
            );
        }
    }


    function populateBoardData(sourceRoot) {

        const source =
            sourceRoot &&
            sourceRoot.matches &&
            sourceRoot.matches(
                "#heat-boardstats-source"
            )
                ? sourceRoot
                : sourceRoot
                    ? sourceRoot.querySelector(
                        "#heat-boardstats-source"
                    )
                    : null;

        if (!source) {
            return false;
        }

        [
            "members",
            "posts",
            "topics",
            "online"
        ].forEach(function (name) {
            copyBoardValue(
                source,
                name,
                '#heat-sidebar ' +
                '[data-heat-board-stat="' +
                    name +
                '"]'
            );
        });

        [
            "members-online",
            "guests-online",
            "anonymous-online",
            "online-today",
            "online-record",
            "daily-online-record"
        ].forEach(function (name) {
            copyBoardValue(
                source,
                name,
                '#heat-sidebar ' +
                '[data-heat-board-activity="' +
                    name +
                '"]'
            );
        });

        populateNewestMember(source);
        populateOnlineTodayList(source);

        return true;
    }


    function loadBoardData() {

        /*
         * Pass 9C: Board Stats are native Board-Index data.
         * The native source itself is the authoritative route signal,
         * including Jcink POST-rendered posting screens whose URL can
         * look like index.php.
         */
        if (!isBoardIndex) {
            return;
        }

        const liveSource =
            document.querySelector(
                "#heat-boardstats-source"
            );

        if (liveSource) {
            populateBoardData(
                liveSource
            );
        }
    }

    loadRecentTopics();
    loadBoardData();
})();
}

if (!(window.HEAT_ACCOUNT_ROUTE && window.HEAT_ACCOUNT_ROUTE.active)) {

/*
 * This script is emitted after the native board markup, so its
 * server-rendered targets already exist. Initialize immediately
 * instead of batching work into DOMContentLoaded.
 */
(function () {

    const profile = document.querySelector(".heat-profile");

    if (!profile) {
        return;
    }

    if (
        window.HEAT_EARLY_UI &&
        typeof window.HEAT_EARLY_UI
            .releaseFeature === "function"
    ) {
        window.HEAT_EARLY_UI.releaseFeature(
            "profile"
        );
    }

    /* =====================================================
       HEAT FIRST-PAINT PASS 4 — FIX 2
       LIGHTWEIGHT PROFILE TAB STATE

       First paint is still selected in the head preflight.
       Runtime clicks now update only the OLD and NEW tab/panel
       instead of rewriting all six buttons and all six panels.

       Panel visibility is owned by .active CSS. The runtime no
       longer toggles the HTML hidden attribute, avoiding repeated
       hidden/display state collisions on every click.
       ===================================================== */

    const tabButtons = Array.from(
        profile.querySelectorAll("[data-profile-tab]")
    );

    const tabPanels = Array.from(
        profile.querySelectorAll("[data-profile-panel]")
    );

    const profileId =
        profile.dataset.memberId ||
        profile.id ||
        "unknown";

    const storageKey =
        "heatProfileTab:" + profileId;

    const buttonsByTab = new Map();
    const panelsByTab = new Map();

    tabButtons.forEach(function (button) {
        buttonsByTab.set(
            button.getAttribute("data-profile-tab"),
            button
        );
    });

    tabPanels.forEach(function (panel) {
        panelsByTab.set(
            panel.getAttribute("data-profile-panel"),
            panel
        );
    });

    let activeTab = "about";

    function saveTab(tabName) {
        try {
            sessionStorage.setItem(
                storageKey,
                tabName
            );
        } catch (error) {
            /* Storage may be unavailable in private browsing. */
        }
    }

    function applyButtonState(button, isActive) {
        if (!button) {
            return;
        }

        button.classList.toggle(
            "active",
            isActive
        );

        button.setAttribute(
            "aria-selected",
            isActive ? "true" : "false"
        );

        button.tabIndex =
            isActive ? 0 : -1;
    }

    function applyPanelState(panel, isActive) {
        if (!panel) {
            return;
        }

        panel.classList.toggle(
            "active",
            isActive
        );

        panel.setAttribute(
            "aria-hidden",
            isActive ? "false" : "true"
        );
    }

    function openProfileTab(tabName, options) {
        const settings = Object.assign(
            {
                remember: true,
                focus: false
            },
            options || {}
        );

        const targetButton =
            buttonsByTab.get(tabName);

        const targetPanel =
            panelsByTab.get(tabName);

        if (!targetButton || !targetPanel) {
            return false;
        }

        if (tabName !== activeTab) {
            const previousButton =
                buttonsByTab.get(activeTab);

            const previousPanel =
                panelsByTab.get(activeTab);

            applyButtonState(
                previousButton,
                false
            );

            applyPanelState(
                previousPanel,
                false
            );

            applyButtonState(
                targetButton,
                true
            );

            applyPanelState(
                targetPanel,
                true
            );

            activeTab = tabName;
        }

        if (settings.remember) {
            saveTab(tabName);
        }

        if (settings.focus) {
            targetButton.focus();
        }

        return true;
    }

    tabButtons.forEach(function (button) {

        button.addEventListener("click", function () {
            openProfileTab(
                button.getAttribute("data-profile-tab")
            );
        });

        button.addEventListener("keydown", function (event) {
            const currentIndex =
                tabButtons.indexOf(button);

            let nextIndex = null;

            if (
                event.key === "ArrowRight" ||
                event.key === "ArrowDown"
            ) {
                nextIndex =
                    (currentIndex + 1) %
                    tabButtons.length;
            }

            if (
                event.key === "ArrowLeft" ||
                event.key === "ArrowUp"
            ) {
                nextIndex =
                    (currentIndex - 1 + tabButtons.length) %
                    tabButtons.length;
            }

            if (event.key === "Home") {
                nextIndex = 0;
            }

            if (event.key === "End") {
                nextIndex =
                    tabButtons.length - 1;
            }

            if (nextIndex === null) {
                return;
            }

            event.preventDefault();

            const nextButton =
                tabButtons[nextIndex];

            openProfileTab(
                nextButton.getAttribute("data-profile-tab"),
                {
                    focus: true
                }
            );
        });

    });

    /* =====================================================
       SAVED PROFILE TAB PREPAINT HANDOFF

       The head has already painted the saved tab. Only the
       static About state and saved target need to be synchronized
       before releasing the temporary html selector.
       ===================================================== */

    const prepaintState =
        window.HEAT_PROFILE_INITIAL_TAB || {};

    const earlyActiveButton =
        profile.querySelector(
            "[data-profile-tab].active"
        );

    const initialTab = String(
        earlyActiveButton &&
        earlyActiveButton.getAttribute(
            "data-profile-tab"
        ) ||
        prepaintState.tab ||
        document.documentElement.getAttribute(
            "data-heat-profile-initial-tab"
        ) ||
        "about"
    );

    if (
        initialTab !== "about" &&
        buttonsByTab.has(initialTab) &&
        panelsByTab.has(initialTab)
    ) {
        openProfileTab(
            initialTab,
            {
                remember: false
            }
        );
    }

    document.documentElement.removeAttribute(
        "data-heat-profile-initial-tab"
    );

    /* -----------------------------------------------------
       VISITOR ONLINE INDICATORS

       Visitor cards are created by the Main Profile template.
       Re-run the shared online service whenever that list changes.
       ----------------------------------------------------- */

    function refreshProfileOnlineStates() {
        if (
            window.HEAT &&
            window.HEAT.online &&
            typeof window.HEAT.online.updateIndicators ===
                "function"
        ) {
            window.HEAT.online.updateIndicators();
        }
    }

    /*
     * Pass 8: Main Profile renders native visitor data immediately while
     * its own markup is being parsed. No visitor-list MutationObserver is
     * needed here; the cards already exist before this controller runs.
     */

    document.addEventListener(
        "heat:online-updated",
        refreshProfileOnlineStates
    );

    window.setTimeout(
        refreshProfileOnlineStates,
        0
    );

})();
}

if (!(window.HEAT_ACCOUNT_ROUTE && window.HEAT_ACCOUNT_ROUTE.active)) {

/* =========================================================
   HEAT STABLE V1 — PHASE 6 OPTIONAL PROFILE LINKS

   All approved app cards and Mini Profile quick-link icons stay
   visible. Empty URL fields are temporarily non-clickable until
   the character supplies a link.
   ========================================================= */

/*
 * This script is emitted after the native board markup, so its
 * server-rendered targets already exist. Initialize immediately
 * instead of batching work into DOMContentLoaded.
 */
(function () {

    const pageRoute =
        window.HEAT_PAGE_ROUTE || {};

    if (
        !pageRoute.isTopic &&
        !pageRoute.isProfile
    ) {
        return;
    }

    function isUsableHeatLink(rawHref) {
        const href = String(rawHref || "").trim();

        if (
            !href ||
            href === "#" ||
            /^javascript:/i.test(href) ||
            /<!--\s*\|field_/i.test(href)
        ) {
            return false;
        }

        return /^(?:https?:\/\/|\/|\.\/|\.\.\/|index\.php(?:\?|$)|\?|mailto:|tel:)/i
            .test(href);
    }

    document
        .querySelectorAll("[data-heat-optional-link]")
        .forEach(function (link) {
            const rawHref = link.getAttribute("href");
            const isLinked = isUsableHeatLink(rawHref);

            link.classList.toggle(
                "is-heat-link-unlinked",
                !isLinked
            );

            if (isLinked) {
                link.removeAttribute("aria-disabled");
                link.removeAttribute("data-heat-link-state");
                return;
            }

            link.removeAttribute("href");
            link.setAttribute("aria-disabled", "true");
            link.setAttribute("data-heat-link-state", "unlinked");

            if (!link.getAttribute("title")) {
                link.setAttribute(
                    "title",
                    "This profile link has not been added yet."
                );
            }

            link.addEventListener("click", function (event) {
                event.preventDefault();
            });
        });

})();
}

if (!(window.HEAT_ACCOUNT_ROUTE && window.HEAT_ACCOUNT_ROUTE.active)) {

/*
 * This script is emitted after the native board markup, so its
 * server-rendered targets already exist. Initialize immediately
 * instead of batching work into DOMContentLoaded.
 */
(function () {

    const pageRoute =
        window.HEAT_PAGE_ROUTE || {};

    if (
        !window.HEAT_IS_BOARD_INDEX &&
        !pageRoute.isSubforum
    ) {
        return;
    }

    const forumCards = document.querySelectorAll(
        document.body.classList.contains("heat-subforum-page")
            ? ".heat-subforum-directory-card"
            : ".heat-main-forum-card"
    );

    forumCards.forEach(function (card) {

        /*
         * The |name| macro normally creates the real
         * Jcink forum link inside .heat-forum-title.
         */

        const destinationLink =
            card.querySelector(".heat-forum-title a");

        if (!destinationLink) {
            return;
        }

        const destination =
            destinationLink.getAttribute("href");

        if (!destination) {
            return;
        }


        /*
         * Make the custom article behave like a link.
         */

        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "link");

        card.setAttribute(
            "aria-label",
            "Enter " +
            destinationLink.textContent.trim()
        );


        /*
         * Clicking blank areas of the card opens
         * the parent forum.
         *
         * Existing links remain independently clickable,
         * including subforums and latest-topic links.
         */

        card.addEventListener("click", function (event) {

            const clickedInteractiveElement =
                event.target.closest(
                    "a, button, input, select, textarea, label"
                );

            if (clickedInteractiveElement) {
                return;
            }

            window.location.href = destination;

        });


        /*
         * Keyboard accessibility.
         */

        card.addEventListener("keydown", function (event) {

            if (
                event.key !== "Enter" &&
                event.key !== " "
            ) {
                return;
            }

            const focusedInteractiveElement =
                event.target.closest(
                    "a, button, input, select, textarea"
                );

            if (focusedInteractiveElement) {
                return;
            }

            event.preventDefault();

            window.location.href = destination;

        });

    });

})();
}

if (!(window.HEAT_ACCOUNT_ROUTE && window.HEAT_ACCOUNT_ROUTE.active)) {
(function () {
    "use strict";

    const refreshHeaderClock =
        window.HEAT_HEADER_CLOCK_REFRESH;

    if (
        typeof refreshHeaderClock !==
        "function"
    ) {
        return;
    }

    let clockTimer = 0;
    let clockStarted = false;

    function scheduleNextMinute() {
        window.clearTimeout(clockTimer);

        const now = Date.now();
        const delay =
            60000 -
            (now % 60000) +
            80;

        clockTimer =
            window.setTimeout(
                function () {
                    refreshHeaderClock();
                    scheduleNextMinute();
                },
                delay
            );
    }

    function startLiveClock() {
        if (clockStarted) {
            return;
        }

        clockStarted = true;

        /*
         * Refresh once after the native load event in case a slow
         * image held the page open across a minute boundary.
         * Only then begin minute-by-minute updates.
         */
        refreshHeaderClock();
        scheduleNextMinute();
    }

    function refreshClockOnReturn() {
        if (
            document.visibilityState !==
            "visible"
        ) {
            return;
        }

        refreshHeaderClock();

        if (clockStarted) {
            scheduleNextMinute();
        }
    }

    if (
        document.readyState ===
        "complete"
    ) {
        startLiveClock();
    } else {
        window.addEventListener(
            "load",
            startLiveClock,
            {
                once: true
            }
        );
    }

    document.addEventListener(
        "visibilitychange",
        refreshClockOnReturn
    );
})();
}

if (!(window.HEAT_ACCOUNT_ROUTE && window.HEAT_ACCOUNT_ROUTE.active)) {

/* =========================================================
   HEAT COMMS REPLY COLLECTOR V5
   PRE-PAINT + PAGINATION + OPTIONAL AUTHOR IDENTITY

   In a topic whose first post contains [data-heat-comm],
   every valid later Jcink post becomes a message bubble.

   V5 preserves the author GIF/nickname modes and adds durable
   later-page concealment plus an editing path for blocked replies
   found on fetched topic pages. Member data comes directly from
   each rendered Post Row:
   - GIF: field_29
   - Nickname: field_13
   - GIF fallback: regular avatar, then neutral HEAT tile
   - Name fallback: display name

   Replies containing another comm template, DOHTML, CSS,
   or JavaScript are blocked instead of being collected.
   ========================================================= */

(function () {
  "use strict";

  const pageRoute = window.HEAT_PAGE_ROUTE || {};

  /*
   * Cleanup Pass 2: the collector is topic-only. On forum, posting,
   * profile and utility routes, exit before creating the collector's
   * pagination, parsing and message-processing runtime.
   */
  if (!pageRoute.isTopic) {
    return;
  }

  var POST_ROW_SELECTOR = "article.heat-post-row";
  var RAW_VIEW_PARAM = "heatcommraw";
  var LATEST_HASH = "#heat-comm-latest";
  var MAX_TOPIC_PAGES = 100;
  var IDENTITY_MODES = {
    "reply-gif": true,
    "group-names": true,
    "group-gifs": true
  };

var COLLECTOR_ADDON_TYPES = {
  silenced: true,
  silence: true,
  reply: true,
  replied: true,
  location: true,
  map: true,
  pin: true,
  pay: true,
  applepay: true,
  payment: true,
  voice: true,
  voicenote: true,
  call: true,
  facetime: true,
  unsent: true
};

  function releasePrepaint() {
    if (
      window.HEAT_COMM_PREPAINT &&
      typeof window.HEAT_COMM_PREPAINT.release === "function"
    ) {
      window.HEAT_COMM_PREPAINT.release();
      return;
    }

    document.documentElement.classList.remove(
      "heat-comm-prepaint",
      "heat-comm-later-page-pending"
    );
  }

  function rememberCommTopic() {
    if (
      window.HEAT_COMM_PREPAINT &&
      typeof window.HEAT_COMM_PREPAINT.remember === "function"
    ) {
      window.HEAT_COMM_PREPAINT.remember();
    }
  }

  function claimCommPrepaint() {
    if (
      window.HEAT_COMM_PREPAINT &&
      typeof window.HEAT_COMM_PREPAINT.claim === "function"
    ) {
      window.HEAT_COMM_PREPAINT.claim();
    }
  }

  function forgetCommTopic() {
    if (
      window.HEAT_COMM_PREPAINT &&
      typeof window.HEAT_COMM_PREPAINT.forget === "function"
    ) {
      window.HEAT_COMM_PREPAINT.forget();
    }
  }


  /* =======================================================
     TOPIC URL + PAGINATION HELPERS
     ======================================================= */

  function parameterValue(url, name) {
    var wanted = String(name).toLowerCase();
    var value = "";

    url.searchParams.forEach(function (item, key) {
      if (!value && key.toLowerCase() === wanted) {
        value = item;
      }
    });

    return value;
  }

  function deleteParameter(url, name) {
    var wanted = String(name).toLowerCase();
    var keys = [];

    url.searchParams.forEach(function (item, key) {
      if (key.toLowerCase() === wanted) {
        keys.push(key);
      }
    });

    keys.forEach(function (key) {
      url.searchParams.delete(key);
    });
  }

  function topicId(url) {
    return parameterValue(url, "showtopic");
  }

  function pageOffset(url) {
    var value = parameterValue(url, "st");

    if (!value || !/^\d+$/.test(value)) {
      return 0;
    }

    return parseInt(value, 10) || 0;
  }

  function firstPageUrl(sourceUrl) {
    var url = new URL(sourceUrl, window.location.href);

    [
      "st",
      "view",
      "p",
      "pid",
      RAW_VIEW_PARAM
    ].forEach(function (name) {
      deleteParameter(url, name);
    });

    url.hash = "";

    return url;
  }

  function pageUrl(baseUrl, offset) {
    var url = new URL(baseUrl.href);

    deleteParameter(url, "st");

    if (offset > 0) {
      url.searchParams.set("st", String(offset));
    }

    url.hash = "";

    return url;
  }

  function rawPageUrl(baseUrl, offset) {
    var url = pageUrl(baseUrl, offset);

    url.searchParams.set(RAW_VIEW_PARAM, "1");

    return url;
  }

  function discoverPageOffsets(sourceDocument, baseUrl, wantedTopicId) {
    var offsets = [];
    var found = Object.create(null);

    Array.from(
      sourceDocument.querySelectorAll('a[href*="showtopic"]')
    ).forEach(function (link) {
      var href = link.getAttribute("href");

      if (!href) return;

      var url;

      try {
        url = new URL(href, baseUrl.href);
      } catch (error) {
        return;
      }

      if (
        url.origin !== window.location.origin ||
        topicId(url) !== wantedTopicId
      ) {
        return;
      }

      /*
         Jcink's get-new-post/find-post links are redirects,
         not stable numbered topic pages.
      */

      if (
        parameterValue(url, "view") ||
        parameterValue(url, "p") ||
        parameterValue(url, "pid")
      ) {
        return;
      }

      var rawOffset = parameterValue(url, "st");

      if (rawOffset && !/^\d+$/.test(rawOffset)) {
        return;
      }

      var offset = pageOffset(url);

      if (!found[offset]) {
        found[offset] = true;
        offsets.push(offset);
      }
    });

    return offsets;
  }

  function fetchTopicDocument(url) {
    return fetch(url.href, {
      credentials: "same-origin",
      cache: "no-store"
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error(
            "Topic page request failed with " +
            response.status
          );
        }

        return response.text();
      })
      .then(function (html) {
        return new DOMParser().parseFromString(
          html,
          "text/html"
        );
      });
  }


  /* =======================================================
     FIND THE POSTER'S PROFILE ID
     ======================================================= */

  function profileId(row) {
    var link = row && row.querySelector(
      '.heat-post-profile-column a[href*="showuser="], ' +
      '.heat-post-profile-column a[href*="MID="]'
    );

    if (!link) return "";

    var href =
      link.getAttribute("href") ||
      link.href ||
      "";

    var match = href.match(/(?:showuser=|MID=)(\d+)/i);

    return match ? match[1] : href;
  }

  function cleanText(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function sourceValue(source) {
    if (!source) return "";

    var image = source.querySelector("img[src]");
    if (image) {
      return cleanText(image.getAttribute("src"));
    }

    var link = source.querySelector("a[href]");
    if (link) {
      return cleanText(link.getAttribute("href"));
    }

    return cleanText(source.textContent || "");
  }

  function normalizeMediaUrl(value) {
    var raw = cleanText(value)
      .replace(/&amp;/gi, "&")
      .replace(/^\[img\]\s*/i, "")
      .replace(/\s*\[\/img\]$/i, "");

    var cssUrl = raw.match(
      /url\(\s*['"]?([^'")]+)['"]?\s*\)/i
    );

    if (cssUrl) {
      raw = cssUrl[1];
    }

    var embedded = raw.match(
      /(https?:\/\/[^\s"'<>]+)/i
    );

    if (embedded) {
      raw = embedded[1];
    }

    if (
      !raw ||
      /^(?:none|null|undefined|n\/a|-)$/i.test(raw)
    ) {
      return "";
    }

    if (raw.indexOf("//") === 0) {
      raw = window.location.protocol + raw;
    }

    try {
      var parsed = new URL(raw, window.location.href);

      if (
        parsed.protocol === "http:" ||
        parsed.protocol === "https:" ||
        parsed.protocol === "data:"
      ) {
        return parsed.href;
      }
    } catch (error) {
      return "";
    }

    return "";
  }

  function backgroundImageUrl(element) {
    if (!element) return "";

    var style = element.getAttribute("style") || "";
    var match = style.match(
      /background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i
    );

    return match ? normalizeMediaUrl(match[1]) : "";
  }

  function displayedMemberName(row) {
    var name = row && row.querySelector(
      ".heat-mini-name a, " +
      ".heat-mini-name, " +
      ".heat-post-profile-column .member-name, " +
      ".heat-post-profile-column a[href*='showuser=']"
    );

    return cleanText(name && name.textContent);
  }

  function rowMemberData(row) {
    var marker = row && row.querySelector(
      "[data-heat-comm-member-data]"
    );

    var nickname = marker
      ? sourceValue(
          marker.querySelector("[data-heat-comm-nickname]")
        )
      : "";

    var gif = marker
      ? normalizeMediaUrl(
          sourceValue(
            marker.querySelector("[data-heat-comm-gif]")
          )
        )
      : "";

    var avatar = marker
      ? normalizeMediaUrl(
          sourceValue(
            marker.querySelector("[data-heat-comm-avatar]")
          )
        )
      : "";

    var displayName = marker
      ? sourceValue(
          marker.querySelector(
            "[data-heat-comm-display-name]"
          )
        )
      : "";

    if (!displayName) {
      displayName = displayedMemberName(row);
    }

    if (!avatar && row) {
      var miniAvatar = row.querySelector(
        ".heat-mini-avatar img[src], " +
        ".heat-mini-avatar"
      );

      avatar = miniAvatar
        ? normalizeMediaUrl(
            miniAvatar.getAttribute("src") ||
            backgroundImageUrl(miniAvatar)
          )
        : "";
    }

    return {
      nickname: nickname || displayName || "HEAT member",
      displayName: displayName || nickname || "HEAT member",
      gif: gif,
      avatar: avatar
    };
  }

  var COMM_GROUP_NAME_TO_ID = {
    guest: "2",
    guests: "2",
    member: "3",
    members: "3",
    admin: "4",
    admins: "4",
    staff: "4",
    administrator: "4",
    administrators: "4",
    adminstaff: "4",
    adminroot: "4",

    giveon: "6",
    rihanna: "7",
    beyonce: "8",
    beyonc: "8",
    drake: "9",
    pink: "10",
    loa: "11",
    leaveofabsence: "11",
    archived: "12",
    archive: "12",
    kendrick: "13",
    kendricklamar: "13",
    sza: "14",
    nasx: "15",
    lilnasx: "15",
    sam: "16",
    samsmith: "16",
    paramore: "17",
    summer: "18",
    summerwalker: "18",
    baby: "19",
    lilbaby: "19",
    doja: "20",
    dojacat: "20",
    flo: "21",
    flomilli: "21",
    cxh: "22",
    chloexhalle: "22",
    chlexhalle: "22",
    adele: "23",
    prince: "24",
    pnd: "25",
    partynextdoor: "25",
    brent: "26",
    brentfaiyaz: "26",
    meg: "27",
    megan: "27",
    megantheestallion: "27",
    lizzo: "28",
    burna: "29",
    burnaboy: "29",
    solange: "30",
    her: "31",
    chance: "32",
    chancetherapper: "32",
    silksonic: "34",
    silk: "34",

    wrath: "35",
    lust: "36",
    envy: "37",
    gluttony: "38",
    greed: "39",
    pride: "40",
    sloth: "41"
  };

  function normalizeCommGroupName(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&amp;/g, "and")
      .replace(/[^a-z0-9]+/g, "");
  }

  function rowGroupId(row) {
    if (!row) return "";

    /*
       Page 1 is the live document and can resolve group ownership
       through HEAT's CSS engine.

       Paginated pages are fetched with DOMParser. Their HEAT CSS and
       runtime do NOT execute, so getComputedStyle() cannot be relied on.
       Read both numeric and named Jcink group markers from the raw
       server-rendered markup instead.
    */

    var candidates = [row].concat(
      Array.from(
        row.querySelectorAll(
          "[data-heat-group-id], " +
          "[data-group-id], " +
          "[data-gid], " +
          "[data-group], " +
          ".heat-mini-profile, " +
          ".heat-mini-name, " +
          ".heat-post-profile-column [class]"
        )
      )
    );

    for (var index = 0; index < candidates.length; index += 1) {
      var candidate = candidates[index];

      if (!candidate || !candidate.getAttribute) {
        continue;
      }

      var direct = cleanText(
        candidate.getAttribute("data-heat-group-id") ||
        candidate.getAttribute("data-group-id") ||
        candidate.getAttribute("data-gid")
      );

      if (/^\d+$/.test(direct)) {
        return direct;
      }

      var namedData =
        COMM_GROUP_NAME_TO_ID[
          normalizeCommGroupName(
            candidate.getAttribute("data-group")
          )
        ];

      if (namedData) {
        return namedData;
      }

      var classes = Array.from(candidate.classList || []);

      for (
        var classIndex = 0;
        classIndex < classes.length;
        classIndex += 1
      ) {
        var className = classes[classIndex];

        var match = className.match(
          /^(?:g|go|group)[-_]?(\d+)$/i
        );

        if (match) {
          return match[1];
        }

        var namedClass =
          COMM_GROUP_NAME_TO_ID[
            normalizeCommGroupName(className)
          ];

        if (namedClass) {
          return namedClass;
        }
      }
    }

    /*
       Live page fallback only.
       Detached DOMParser pages do not participate in the live document's
       CSS cascade, so reading computed custom properties there can return
       nothing useful.
    */

    if (
      row.ownerDocument === document &&
      row.isConnected
    ) {
      var resolved = cleanText(
        window
          .getComputedStyle(row)
          .getPropertyValue("--heat-group-id-value")
      );

      if (/^\d+$/.test(resolved)) {
        return resolved;
      }
    }

    return "";
  }

  function commIdentityMode(comm) {
    var mode = cleanText(
      comm && comm.getAttribute("data-heat-comm-mode")
    ).toLowerCase();

    return IDENTITY_MODES[mode] ? mode : "";
  }

  function addAuthorMedia(message, member) {
    var media = document.createElement("span");
    var image = document.createElement("img");
    var candidates = [member.gif, member.avatar].filter(
      function (url, index, list) {
        return url && list.indexOf(url) === index;
      }
    );
    var candidateIndex = 0;

    media.className = "heat-comm-author-media";
    media.title = member.nickname;
    media.setAttribute(
      "aria-label",
      member.nickname + "'s image"
    );

    if (candidates.length) {
      image.setAttribute("aria-hidden", "true");
      image.decoding = "async";

      image.addEventListener("error", function () {
        candidateIndex += 1;

        if (candidateIndex < candidates.length) {
          image.src = candidates[candidateIndex];
        } else {
          image.remove();
          media.classList.add("is-heat-placeholder");
        }
      });

      image.src = candidates[candidateIndex];
      media.appendChild(image);
    } else {
      media.classList.add("is-heat-placeholder");
    }

    message.appendChild(media);
  }

  function stampMessageGroup(message, row) {
    if (!message || !row) return;

    var groupId = rowGroupId(row);

    if (groupId) {
      message.setAttribute(
        "data-heat-group-id",
        groupId
      );
    }
  }

  function decorateMessageAuthor(message, row, mode) {
    if (!message || !row) return;

    /*
       Group ownership belongs to every collected message.
       It must not depend on nickname/GIF identity mode.
    */
    stampMessageGroup(message, row);

    if (
      !mode ||
      message.dataset.heatCommAuthor === "ready"
    ) {
      return;
    }

    var member = rowMemberData(row);
    var bubble = message.querySelector(".heat-comm-bubble");
    var name = document.createElement("span");

    if (!bubble) return;

    message.dataset.heatCommAuthor = "ready";
    message.classList.add("has-heat-comm-author");

    addAuthorMedia(message, member);

    name.className = "heat-comm-author-name";
    name.textContent = member.nickname;
    name.title = member.nickname;

    message.insertBefore(name, bubble);
  }

  function decorateOpeningMessage(opening, mode) {
    if (!opening) return;

    var starter = opening.comm.querySelector(
      ".heat-comm-messages " +
      ".heat-comm-message.is-starter"
    );

    if (!starter) return;

    stampMessageGroup(
      starter,
      opening.row
    );

    if (mode) {
      decorateMessageAuthor(
        starter,
        opening.row,
        mode
      );
    }
  }


  /* =======================================================
     GET THE POST'S READABLE DATE/TIME
     ======================================================= */

  function readableTime(row) {
    var date = row.querySelector(".heat-post-permalink");

    if (!date) return "";

    return date.textContent
      .replace(/^\s*Posted\s*/i, "")
      .trim();
  }


  /* =======================================================
     GIVE EVERY POST A STABLE COLLECTOR KEY
     ======================================================= */

  function postKey(row, offset, index) {
    var postColor = row.querySelector(
      '.postcolor[id], [id^="pid_"]'
    );

    var permalink = row.querySelector(
      '.heat-post-permalink[href], ' +
      '.heat-post-permalink a[href]'
    );

    var permalinkHref = permalink
      ? (
          permalink.getAttribute("href") ||
          permalink.href ||
          ""
        )
      : "";

    var permalinkMatch = permalinkHref.match(
      /(?:[?&](?:p|pid)=|#(?:entry|post|pid_))(\d+)/i
    );

    var directId =
      row.dataset.postId ||
      row.getAttribute("data-post-id") ||
      row.id ||
      (postColor ? postColor.id : "") ||
      (permalinkMatch ? permalinkMatch[1] : "");

    if (directId) {
      return "post:" + directId;
    }

    return "page:" + offset + ":row:" + index;
  }


  /* =======================================================
     DETECT ACCIDENTALLY PASTED TEMPLATE CODE

     This catches:
     - A rendered comm shell
     - Literal [dohtml] code
     - Another data-heat-comm attribute
     - Pasted CSS or JavaScript
     ======================================================= */

  function containsCommCode(source) {
    if (!source) return false;

    if (
      source.querySelector(
        "[data-heat-comm], " +
        ".heat-comm, " +
        ".heat-comm-main, " +
        ".heat-comm-messages"
      )
    ) {
      return true;
    }

    var text = source.textContent
      .replace(/\u00a0/g, " ")
      .toLowerCase();

    var codeMarkers = [
      "[dohtml]",
      "[/dohtml]",
      "data-heat-comm",
      "heat-comm-main",
      "heat-comm-messages",
      "heat-comm-composer",
      "heat comms reply collector",
      "<style",
      "</style>",
      "<" + "script",
      "<" + "/script>"
    ];

    return codeMarkers.some(function (marker) {
      return text.indexOf(marker) !== -1;
    });
  }


  /* =======================================================
     DISPLAY A WARNING ON AN INVALID LIVE REPLY

     The original post remains visible so the member can
     edit or delete it.
     ======================================================= */

  function showBlockedWarning(row, source) {
    if (!row || !source) return;

    if (source.querySelector(".heat-comm-code-warning")) {
      return;
    }

    var warning = document.createElement("div");

    warning.className = "heat-comm-code-warning";

    warning.innerHTML =
      "<strong>Message not added to the comm.</strong>" +
      "<span>This reply appears to contain comm template code. " +
      "Edit or delete the reply, then post only your character's message.</span>";

    source.insertBefore(warning, source.firstChild);

    row.classList.add("heat-comm-blocked-reply");

    row.dataset.heatCommCollected = "blocked";
  }


/* =======================================================
   COLLECTOR ADD-ON PACK V1

   Lightweight post-body tags for special collector events.
   One reply equals one event card.
   ======================================================= */

function parseAddonAlias(type) {
  var normalized = cleanText(type).toLowerCase();

  if (normalized === "silence") return "silenced";
  if (normalized === "replied") return "reply";
  if (normalized === "map" || normalized === "pin") return "location";
  if (
    normalized === "applepay" ||
    normalized === "payment"
  ) {
    return "pay";
  }
  if (normalized === "voicenote") return "voice";
  if (normalized === "facetime") return "call";

  return normalized;
}

function sourcePlainText(source) {
  if (!source) return "";

  var html = String(source.innerHTML || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
    .replace(/<\/div>\s*<div[^>]*>/gi, "\n")
    .replace(/<\/li>\s*<li[^>]*>/gi, "\n")
    .replace(/<\/tr>\s*<tr[^>]*>/gi, "\n");

  var plain = document.createElement("div");
  plain.innerHTML = html;

  return plain.textContent
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .trim();
}

function parseCollectorAddon(source) {
  var text = sourcePlainText(source);
  var match = text.match(/^[\[]([a-z0-9_-]+)[\]]([\s\S]*?)[\[]\/\1[\]]$/i);

  if (!match) return null;

  var type = parseAddonAlias(match[1]);

  if (!COLLECTOR_ADDON_TYPES[type]) {
    return null;
  }

  var rawBody = String(match[2] || "")
    .replace(/^\s+|\s+$/g, "");

  var fields = Object.create(null);
  var lines = rawBody ? rawBody.split(/\n+/) : [];
  var messageLines = [];

  lines.forEach(function (line) {
    var cleaned = String(line || "").trim();
    var separatorIndex = cleaned.indexOf("=");

    if (!cleaned) return;

    if (separatorIndex === -1) {
      messageLines.push(cleaned);
      return;
    }

    var key = cleanText(
      cleaned.slice(0, separatorIndex)
    ).toLowerCase();
    var value = cleanText(
      cleaned.slice(separatorIndex + 1)
    );

    if (!key) {
      messageLines.push(cleaned);
      return;
    }

    fields[key] = value;
  });

  if (messageLines.length && !fields.message) {
    fields.message = messageLines.join("\n");
  }

  return {
    type: type,
    fields: fields,
    rawText: text
  };
}

function createAddonNode(tagName, className, text) {
  var node = document.createElement(tagName);

  if (className) {
    node.className = className;
  }

  if (typeof text !== "undefined" && text !== null) {
    node.textContent = text;
  }

  return node;
}

function addonTheme(type) {
  if (type === "reply") return "pink";
  if (type === "location" || type === "pay") return "green";
  if (type === "voice" || type === "silenced") return "blue";
  if (type === "call") return "orange";

  return "blue";
}

function addonIcon(type, fields) {
  if (type === "silenced") return "🔕";
  if (type === "reply") return "↩️";
  if (type === "location") return "📍";
  if (type === "pay") return "💸";
  if (type === "voice") return "🎙️";
  if (type === "call") {
    var rawType = cleanText(fields.type).toLowerCase();
    return rawType === "facetime" ? "📹" : "📞";
  }
  if (type === "unsent") return "🗑️";

  return "✦";
}

function addonTitle(type, fields) {
  if (type === "silenced") return "Notifications Silenced";
  if (type === "reply") return "Reply";
  if (type === "location") return "Location Shared";
  if (type === "voice") return "Voice Note";
  if (type === "unsent") return "Message Unsent";

  if (type === "pay") {
    var payType = cleanText(fields.type).toLowerCase();
    if (payType === "sent" || payType === "payment") return "Apple Pay Sent";
    if (payType === "received") return "Apple Pay Received";
    if (payType === "paid") return "Apple Pay Paid";
    return "Apple Pay Request";
  }

  if (type === "call") {
    var callType = cleanText(fields.type).toLowerCase();
    var callStatus = cleanText(fields.status).toLowerCase();
    var callName = callType === "facetime" ? "FaceTime" : "Call";

    if (callStatus === "missed") return "Missed " + callName;
    if (callStatus === "ended") return callName + " ended";
    if (callStatus === "incoming") return "Incoming " + callName;
    if (callStatus === "declined") return callName + " declined";

    return callName;
  }

  return "Update";
}

function addonSubtitle(type, actorName, fields) {
  if (type === "silenced") {
    return actorName + " has notifications silenced";
  }
  if (type === "reply") {
    return actorName + " replied to a message";
  }
  if (type === "location") {
    return actorName + " shared a location";
  }
  if (type === "voice") {
    return actorName + " sent a voice message";
  }
  if (type === "unsent") {
    return actorName + " unsent a message";
  }
  if (type === "pay") {
    var payType = cleanText(fields.type).toLowerCase();
    if (payType === "sent" || payType === "payment") return actorName + " sent a payment";
    if (payType === "received") return actorName + " received a payment";
    if (payType === "paid") return actorName + " marked a payment as paid";
    return actorName + " requested a payment";
  }
  if (type === "call") {
    var callType = cleanText(fields.type).toLowerCase();
    var status = cleanText(fields.status).toLowerCase();
    var callLabel = callType === "facetime" ? "FaceTime call" : "call";

    if (status === "missed") return actorName + " missed a " + callLabel;
    if (status === "ended") return actorName + " ended a " + callLabel;
    if (status === "incoming") return actorName + " received a " + callLabel;
    if (status === "declined") return actorName + " declined a " + callLabel;
    if (status === "ongoing" || status === "active") return actorName + " is on a " + callLabel;

    return actorName + " started a " + callLabel;
  }

  return actorName;
}

function appendAddonFooter(container, label, timeText) {
  if (!timeText) return;

  var foot = createAddonNode(
    "div",
    "heat-comm-addon-foot heat-comm-addon-foot--time-only"
  );

  foot.appendChild(
    createAddonNode(
      "span",
      "heat-comm-addon-foot-time",
      timeText
    )
  );

  container.appendChild(foot);
}

function renderReplyAddonBody(body, fields, timeText) {
  var quote = createAddonNode(
    "div",
    "heat-comm-addon-reply-quote"
  );
  quote.appendChild(
    createAddonNode(
      "span",
      "heat-comm-addon-reply-label",
      "Replying to"
    )
  );
  quote.appendChild(
    createAddonNode(
      "p",
      "heat-comm-addon-reply-text",
      fields.quote || "Previous message"
    )
  );

  body.appendChild(quote);

  if (fields.message) {
    body.appendChild(
      createAddonNode(
        "div",
        "heat-comm-addon-note",
        fields.message
      )
    );
  }

  appendAddonFooter(body, "", timeText);
}

function renderLocationAddonBody(body, fields, timeText) {
  var box = createAddonNode(
    "div",
    "heat-comm-addon-location-box"
  );
  var map = createAddonNode(
    "div",
    "heat-comm-addon-map-thumb"
  );
  var pin = createAddonNode(
    "div",
    "heat-comm-addon-map-pin"
  );
  var meta = createAddonNode(
    "div",
    "heat-comm-addon-location-meta"
  );
  var actions = createAddonNode(
    "div",
    "heat-comm-addon-btn-row"
  );

  map.appendChild(pin);
  meta.appendChild(
    createAddonNode(
      "strong",
      "heat-comm-addon-location-name",
      fields.name || "Shared location"
    )
  );
  meta.appendChild(
    createAddonNode(
      "small",
      "heat-comm-addon-location-address",
      fields.address || "Location details unavailable"
    )
  );

  actions.appendChild(
    createAddonNode(
      "span",
      "heat-comm-addon-btn is-primary",
      "Open in Maps"
    )
  );
  actions.appendChild(
    createAddonNode(
      "span",
      "heat-comm-addon-btn",
      "Share ETA"
    )
  );

  box.appendChild(map);
  box.appendChild(meta);
  box.appendChild(actions);
  body.appendChild(box);
  appendAddonFooter(body, "", timeText);
}

function renderPayAddonBody(body, fields, timeText) {
  var head = createAddonNode(
    "div",
    "heat-comm-addon-pay-head"
  );
  var amountWrap = createAddonNode(
    "div",
    "heat-comm-addon-pay-amount"
  );
  var type = cleanText(fields.type).toLowerCase();
  var typeLabel =
    type === "sent" || type === "payment"
      ? "sent"
      : type === "received"
      ? "received"
      : type === "paid"
      ? "paid"
      : "request";
  var amountValue = cleanText(fields.amount);
  var card = createAddonNode(
    "div",
    "heat-comm-addon-pay-card is-pay-" + typeLabel
  );

  var brand = createAddonNode(
    "div",
    "heat-comm-addon-pay-brand"
  );
  brand.appendChild(
    createAddonNode(
      "i",
      "ph ph-wallet",
      ""
    )
  );
  brand.appendChild(
    createAddonNode(
      "span",
      "heat-comm-addon-pay-logo",
      "Apple Pay"
    )
  );
  head.appendChild(brand);

  amountWrap.appendChild(
    createAddonNode(
      "strong",
      "heat-comm-addon-pay-amount-value",
      amountValue
        ? (amountValue.charAt(0) === "$" ? amountValue : "$" + amountValue)
        : "$0"
    )
  );
  amountWrap.appendChild(
    createAddonNode(
      "small",
      "heat-comm-addon-pay-amount-label",
      typeLabel
    )
  );
  head.appendChild(amountWrap);
  card.appendChild(head);

  if (fields.note) {
    card.appendChild(
      createAddonNode(
        "p",
        "heat-comm-addon-pay-note",
        fields.note
      )
    );
  }

  var actions = createAddonNode(
    "div",
    "heat-comm-addon-btn-row heat-comm-addon-pay-actions"
  );

  if (typeLabel === "request") {
    actions.appendChild(
      createAddonNode(
        "span",
        "heat-comm-addon-btn is-primary",
        "Pay"
      )
    );
  }

  actions.appendChild(
    createAddonNode(
      "span",
      "heat-comm-addon-btn",
      typeLabel === "request" ? "Details" : "View details"
    )
  );

  card.appendChild(actions);
  body.appendChild(card);
  appendAddonFooter(body, "", timeText);
}

function renderVoiceAddonBody(body, fields, timeText) {
  if (fields.transcript) {
    body.classList.add("has-voice-transcript");
  }

  var wave = createAddonNode(
    "div",
    "heat-comm-addon-wave"
  );
  var play = createAddonNode(
    "div",
    "heat-comm-addon-wave-play",
    "▶"
  );
  var bars = createAddonNode(
    "div",
    "heat-comm-addon-wave-bars"
  );
  var duration = createAddonNode(
    "small",
    "heat-comm-addon-wave-duration",
    fields.duration || "0:00"
  );
  var barCount = 12;
  var audioSrc = normalizeMediaUrl(fields.src);

  wave.appendChild(play);
  for (var index = 0; index < barCount; index += 1) {
    bars.appendChild(createAddonNode("span", "", ""));
  }
  wave.appendChild(bars);
  wave.appendChild(duration);
  body.appendChild(wave);

  if (audioSrc) {
    body.classList.add("has-voice-audio");

    var audio = createAddonNode(
      "audio",
      "heat-comm-addon-audio"
    );
    audio.controls = true;
    audio.preload = "none";
    audio.src = audioSrc;
    body.appendChild(audio);
  }

  if (fields.transcript) {
    var transcript = createAddonNode(
      "div",
      "heat-comm-addon-transcript"
    );
    transcript.appendChild(
      createAddonNode(
        "strong",
        "",
        "Transcript"
      )
    );
    transcript.appendChild(
      createAddonNode(
        "p",
        "",
        fields.transcript
      )
    );
    body.appendChild(transcript);
  }

  appendAddonFooter(body, "", timeText);
}

function renderCallAddonBody(body, fields, timeText) {
  var grid = createAddonNode(
    "div",
    "heat-comm-addon-call-grid"
  );
  var rawStatus = cleanText(fields.status).toLowerCase() || "ended";
  var rawType = cleanText(fields.type).toLowerCase();
  var isFaceTime = rawType === "facetime";
  var niceType = isFaceTime ? "FaceTime" : "Call";
  var card = createAddonNode(
    "div",
    "heat-comm-addon-call-mini is-call-" + (isFaceTime ? "facetime" : "phone") + " is-status-" + rawStatus
  );
  var icon = createAddonNode(
    "div",
    "heat-comm-addon-call-icon"
  );
  icon.appendChild(
    createAddonNode(
      "i",
      isFaceTime ? "ph ph-video-camera" : "ph ph-phone",
      ""
    )
  );

  var copy = createAddonNode(
    "div",
    "heat-comm-addon-call-copy"
  );
  var headline = niceType;
  var detail = fields.duration ? fields.duration : "";

  if (rawStatus === "ended") {
    headline = niceType + " ended";
  } else if (rawStatus === "missed") {
    headline = "Missed " + niceType.toLowerCase();
  } else if (rawStatus === "incoming") {
    headline = "Incoming " + niceType.toLowerCase();
  } else if (rawStatus === "declined") {
    headline = niceType + " declined";
  } else if (rawStatus === "ongoing" || rawStatus === "active") {
    headline = niceType + " active";
  }

  copy.appendChild(
    createAddonNode(
      "strong",
      "",
      headline
    )
  );

  if (detail) {
    copy.appendChild(
      createAddonNode(
        "small",
        "",
        "Duration · " + detail
      )
    );
  }

  var state = createAddonNode(
    "span",
    "heat-comm-addon-call-state",
    ""
  );

  card.appendChild(icon);
  card.appendChild(copy);
  card.appendChild(state);
  grid.appendChild(card);
  body.appendChild(grid);
  appendAddonFooter(body, "", timeText);
}

function buildCollectorAddonMessage(
  row,
  identityMode,
  addon,
  isStarter
) {
  var message = document.createElement("div");
  var bubble = document.createElement("div");
  var member = rowMemberData(row);
  var actorName = member.displayName || member.nickname || "HEAT member";
  var timeText = readableTime(row);

  message.className = "heat-comm-message is-addon-" + addon.type;
  message.dataset.sourcePostId = row.dataset.postId || "";

  if (isStarter) {
    message.classList.add("is-starter");
  }

  if (
    addon.type === "unsent" ||
    addon.type === "silenced"
  ) {
    message.classList.add("is-addon-system");
    bubble.className = "heat-comm-bubble is-addon-system-wrap";
    bubble.appendChild(
      createAddonNode(
        "div",
        "heat-comm-addon-systemline",
        addonIcon(addon.type, addon.fields) + " " + addonSubtitle(addon.type, actorName, addon.fields)
      )
    );
    message.appendChild(bubble);
    return message;
  }

  bubble.className = "heat-comm-bubble is-addon-card is-addon-" + addon.type;

  var article = createAddonNode(
    "article",
    "heat-comm-addon-event is-addon-" + addon.type + " theme-" + addonTheme(addon.type)
  );
  var head = createAddonNode(
    "div",
    "heat-comm-addon-head"
  );
  var icon = createAddonNode(
    "div",
    "heat-comm-addon-icon",
    addonIcon(addon.type, addon.fields)
  );
  var titleWrap = createAddonNode(
    "div",
    "heat-comm-addon-title"
  );
  var body = createAddonNode(
    "div",
    "heat-comm-addon-body"
  );
  var subtitleText = addonSubtitle(addon.type, actorName, addon.fields);
  var subtitle = createAddonNode(
    "small",
    ""
  );

  titleWrap.appendChild(
    createAddonNode(
      "strong",
      "",
      addonTitle(addon.type, addon.fields)
    )
  );
  subtitle.appendChild(
    createAddonNode(
      "span",
      "heat-comm-addon-accent",
      actorName
    )
  );
  subtitle.appendChild(
    document.createTextNode(
      subtitleText.slice(actorName.length)
    )
  );
  titleWrap.appendChild(subtitle);

  head.appendChild(icon);
  head.appendChild(titleWrap);
  article.appendChild(head);

  if (addon.type === "reply") {
    renderReplyAddonBody(body, addon.fields, timeText);
  } else if (addon.type === "location") {
    renderLocationAddonBody(body, addon.fields, timeText);
  } else if (addon.type === "pay") {
    renderPayAddonBody(body, addon.fields, timeText);
  } else if (addon.type === "voice") {
    renderVoiceAddonBody(body, addon.fields, timeText);
  } else if (addon.type === "call") {
    renderCallAddonBody(body, addon.fields, timeText);
  }

  article.appendChild(body);
  bubble.appendChild(article);
  message.appendChild(bubble);

  decorateMessageAuthor(
    message,
    row,
    identityMode
  );

  return message;
}

  /* =======================================================
     BUILD A VALID MESSAGE BUBBLE
     ======================================================= */

  function buildBubble(
    row,
    starterId,
    isLiveRow,
    identityMode
  ) {
    var source = row.querySelector(".postcolor");

    if (!source) return null;

    if (containsCommCode(source)) {
      if (isLiveRow) {
        showBlockedWarning(row, source);
      }

      return null;
    }

    var isStarter =
      profileId(row) &&
      profileId(row) === starterId;

    var addon = parseCollectorAddon(source);

    if (addon) {
      return buildCollectorAddonMessage(
        row,
        identityMode,
        addon,
        isStarter
      );
    }

    var message = document.createElement("div");

    message.className = "heat-comm-message";

    message.dataset.sourcePostId =
      row.dataset.postId || "";

    if (isStarter) {
      message.classList.add("is-starter");
    }

    var bubble = document.createElement("div");

    bubble.className = "heat-comm-bubble";

    var rawText = source.textContent.trim();

    var wrappedMessage = rawText.match(
      /^<div\s+class=["']heat-comm-message["'][^>]*>([\s\S]*?)<\/div>$/i
    );

    if (wrappedMessage) {
      bubble.textContent = wrappedMessage[1].trim();
    } else {
      /*
         Preserve normal Jcink formatting, links, GIFs,
         images, and other safe message content.
      */

      Array.from(source.childNodes).forEach(function (node) {
        bubble.appendChild(node.cloneNode(true));
      });
    }

    /*
       MEDIA-ONLY CLASSIFICATION

       Do this in JS rather than CSS :only-child.

       CSS :only-child ignores text nodes, so a reply such as:
         "that is crazy 😂"
       can still have an <img> as its only ELEMENT child and be
       mistaken for an image-only message.

       Mark a bubble as media-only only when:
       - it contains no readable text
       - it contains exactly one image
       - that image is not a native Jcink smilie/emoticon
    */

    var bubbleText = bubble.textContent
      .replace(/\u00a0/g, " ")
      .trim();

    var bubbleImages = Array.from(
      bubble.querySelectorAll("img")
    );

    var realMediaImages = bubbleImages.filter(
      function (image) {
        var alt = cleanText(
          image.getAttribute("alt")
        ).toLowerCase();

        var src = String(
          image.getAttribute("src") ||
          image.src ||
          ""
        ).toLowerCase();

        return !(
          alt === "smilie" ||
          src.indexOf("/html/emoticons/") !== -1 ||
          src.indexOf("/emoticons/") !== -1
        );
      }
    );

    if (
      !bubbleText &&
      bubbleImages.length === 1 &&
      realMediaImages.length === 1
    ) {
      bubble.classList.add("is-media-only");
    }

    var time = document.createElement("div");

    time.className = "heat-comm-time";
    time.textContent = readableTime(row);

    message.appendChild(bubble);

    if (time.textContent) {
      message.appendChild(time);
    }

    decorateMessageAuthor(
      message,
      row,
      identityMode
    );

    return message;
  }


  /* =======================================================
     FIND THE OPENING COMM ON A DOCUMENT
     ======================================================= */

  function findOpening(sourceDocument) {
    var rows = Array.from(
      sourceDocument.querySelectorAll(POST_ROW_SELECTOR)
    );

    var result = null;

    rows.some(function (row, index) {
      var possibleComm = row.querySelector(
        "[data-heat-comm]"
      );

      if (!possibleComm) return false;

      result = {
        comm: possibleComm,
        row: row,
        index: index,
        rows: rows
      };

      return true;
    });

    return result;
  }


  /* =======================================================
     LOAD EVERY NUMBERED PAGE IN THIS TOPIC
     ======================================================= */

  function loadTopicPages(baseUrl, wantedTopicId) {
    var pages = new Map();
    var queued = Object.create(null);
    var queue = [];

    pages.set(0, {
      offset: 0,
      document: document,
      isLive: true
    });

    function enqueue(offset) {
      if (
        offset <= 0 ||
        pages.has(offset) ||
        queued[offset]
      ) {
        return;
      }

      queued[offset] = true;
      queue.push(offset);
      queue.sort(function (first, second) {
        return first - second;
      });
    }

    discoverPageOffsets(
      document,
      baseUrl,
      wantedTopicId
    ).forEach(enqueue);

    function next() {
      if (
        !queue.length ||
        pages.size >= MAX_TOPIC_PAGES
      ) {
        return Promise.resolve(pages);
      }

      var offset = queue.shift();
      delete queued[offset];

      if (pages.has(offset)) {
        return next();
      }

      var url = pageUrl(baseUrl, offset);

      claimCommPrepaint();

      return fetchTopicDocument(url)
        .then(function (sourceDocument) {
          pages.set(offset, {
            offset: offset,
            document: sourceDocument,
            isLive: false
          });

          discoverPageOffsets(
            sourceDocument,
            baseUrl,
            wantedTopicId
          ).forEach(enqueue);
        })
        .catch(function (error) {
          console.warn(
            "HEAT comm collector could not load topic page " +
            offset + ".",
            error
          );
        })
        .then(next);
    }

    return next();
  }


  /* =======================================================
     KEEP THE NEWEST MESSAGE IN VIEW
     ======================================================= */

  function scrollToLatest(messageList, openingRow) {
    function pinToBottom() {
      messageList.scrollTop = messageList.scrollHeight;
    }

    pinToBottom();

    window.requestAnimationFrame(pinToBottom);
    window.setTimeout(pinToBottom, 250);

    Array.from(
      messageList.querySelectorAll("img")
    ).forEach(function (image) {
      if (!image.complete) {
        image.addEventListener("load", pinToBottom, {
          once: true
        });
      }
    });

    if (window.location.hash === LATEST_HASH) {
      openingRow.scrollIntoView({
        block: "start"
      });
    }
  }


  /* =======================================================
     LINK BLOCKED REMOTE REPLIES BACK TO THEIR RAW PAGE
     ======================================================= */

  function showRemoteBlockedWarnings(
    opening,
    baseUrl,
    blockedPages
  ) {
    var existing = opening.comm.parentNode.querySelector(
      ".heat-comm-remote-warnings"
    );

    if (existing) {
      existing.remove();
    }

    var entries = Object.keys(blockedPages)
      .map(function (offset) {
        return blockedPages[offset];
      })
      .sort(function (first, second) {
        return first.offset - second.offset;
      });

    if (!entries.length) return;

    var warnings = document.createElement("div");

    warnings.className = "heat-comm-remote-warnings";
    warnings.setAttribute(
      "aria-label",
      "Comm replies needing attention"
    );

    entries.forEach(function (entry) {
      var warning = document.createElement("div");
      var heading = document.createElement("strong");
      var explanation = document.createElement("span");
      var action = document.createElement("a");
      var replyLabel = entry.count === 1
        ? "One reply"
        : entry.count + " replies";

      warning.className =
        "heat-comm-code-warning heat-comm-remote-warning";
      warning.setAttribute("role", "alert");

      heading.textContent =
        replyLabel + " need" +
        (entry.count === 1 ? "s" : "") +
        " attention.";

      explanation.textContent = entry.count === 1
        ? "The reply contains comm template code, so it was not " +
          "added to the phone. Open its raw topic page to edit " +
          "or delete it."
        : "These replies contain comm template code, so they were " +
          "not added to the phone. Open their raw topic page to " +
          "edit or delete them.";

      action.className = "heat-comm-raw-page-link";
      action.href = rawPageUrl(
        baseUrl,
        entry.offset
      ).href;
      action.textContent = "Open raw topic page";

      warning.appendChild(heading);
      warning.appendChild(explanation);
      warning.appendChild(action);
      warnings.appendChild(warning);
    });

    opening.comm.insertAdjacentElement(
      "afterend",
      warnings
    );
  }


  /* =======================================================
     COLLECT ALL LOADED TOPIC PAGES INTO THE LIVE COMM
     ======================================================= */

  function collectPages(pages, opening, baseUrl) {
    opening.row.dataset.heatCommOpening = "true";

    var starterId = profileId(opening.row);
    var identityMode = commIdentityMode(opening.comm);
    var messageList = opening.comm.querySelector(
      ".heat-comm-messages"
    );

    if (!messageList) return;

    if (identityMode) {
      opening.comm.setAttribute(
        "data-heat-comm-mode",
        identityMode
      );
    }

    /*
       Always establish the opening post's own group ownership.
    */
    decorateOpeningMessage(
      opening,
      identityMode
    );

    var seenPosts = Object.create(null);
    var blockedPages = Object.create(null);

    Array.from(pages.values())
      .sort(function (first, second) {
        return first.offset - second.offset;
      })
      .forEach(function (page) {
        var rows = Array.from(
          page.document.querySelectorAll(
            POST_ROW_SELECTOR
          )
        );

        rows.forEach(function (row, index) {
          if (
            page.offset === 0 &&
            index <= opening.index
          ) {
            return;
          }

          var key = postKey(
            row,
            page.offset,
            index
          );

          if (seenPosts[key]) return;
          seenPosts[key] = true;

          if (
            page.isLive &&
            (
              row.dataset.heatCommCollected === "true" ||
              row.dataset.heatCommCollected === "blocked"
            )
          ) {
            return;
          }

          var bubble = buildBubble(
            row,
            starterId,
            page.isLive,
            identityMode
          );

          /*
             Invalid code replies are never injected into the
             phone. Live invalid replies remain visible.
          */

          if (!bubble) {
            if (
              !page.isLive &&
              containsCommCode(
                row.querySelector(".postcolor")
              )
            ) {
              if (!blockedPages[page.offset]) {
                blockedPages[page.offset] = {
                  count: 0,
                  offset: page.offset
                };
              }

              blockedPages[page.offset].count += 1;
            }

            return;
          }

          messageList.appendChild(bubble);

          if (page.isLive) {
            row.dataset.heatCommCollected = "true";
            row.classList.add(
              "heat-comm-hidden-reply"
            );
          }
        });
      });

    showRemoteBlockedWarnings(
      opening,
      baseUrl,
      blockedPages
    );

    scrollToLatest(messageList, opening.row);
  }


  /* =======================================================
     RAW VIEW FOR EDITING A BLOCKED PAGINATED REPLY
     ======================================================= */

  function showRawBlockedReplies() {
    Array.from(
      document.querySelectorAll(POST_ROW_SELECTOR)
    ).forEach(function (row) {
      if (row.querySelector("[data-heat-comm]")) {
        return;
      }

      var source = row.querySelector(".postcolor");

      if (containsCommCode(source)) {
        showBlockedWarning(row, source);
      }
    });
  }


  /* =======================================================
     ACTIVATE THE COMM THREAD
     ======================================================= */

  function activateComm() {
    var currentUrl = new URL(window.location.href);
    var wantedTopicId = topicId(currentUrl);

    /*
       Leave every non-topic page completely unchanged.
    */

    if (!wantedTopicId) return;

    if (
      parameterValue(currentUrl, RAW_VIEW_PARAM) === "1"
    ) {
      releasePrepaint();
      showRawBlockedReplies();
      return;
    }

    var baseUrl = firstPageUrl(currentUrl);
    var currentOffset = pageOffset(currentUrl);

    /*
       A later Jcink page does not contain the opening shell.
       Verify page 1 before redirecting, so ordinary topics
       remain untouched.
    */

    if (currentOffset > 0) {
      claimCommPrepaint();

      fetchTopicDocument(baseUrl)
        .then(function (firstDocument) {
          if (!findOpening(firstDocument)) {
            forgetCommTopic();
            releasePrepaint();
            return;
          }

          rememberCommTopic();

          var destination = new URL(baseUrl.href);
          destination.hash = LATEST_HASH;

          window.location.replace(destination.href);
        })
        .catch(function (error) {
          releasePrepaint();

          console.warn(
            "HEAT comm collector could not verify page 1.",
            error
          );
        });

      return;
    }

    var opening = findOpening(document);

    if (!opening) {
      forgetCommTopic();
      releasePrepaint();
      return;
    }

    claimCommPrepaint();

    document.documentElement.classList.add(
      "heat-comm-topic"
    );

    rememberCommTopic();

    loadTopicPages(baseUrl, wantedTopicId)
      .then(function (pages) {
        collectPages(
          pages,
          opening,
          baseUrl
        );
        releasePrepaint();
      })
      .catch(function (error) {
        /*
           If an unexpected crawl error occurs, retain the
           original page-only behavior instead of breaking
           the comm completely.
        */

        console.warn(
          "HEAT comm pagination collector fell back to page 1.",
          error
        );

        collectPages(
          new Map([
            [
              0,
              {
                offset: 0,
                document: document,
                isLive: true
              }
            ]
          ]),
          opening,
          baseUrl
        );

        releasePrepaint();
      });
  }


  /* =======================================================
     RUN IMMEDIATELY AFTER THE BOARD MARKUP
     ======================================================= */

  activateComm();
})();
}

if (!(window.HEAT_ACCOUNT_ROUTE && window.HEAT_ACCOUNT_ROUTE.active)) {

/* =========================================================
   HEAT POST DRAFT AUTOSAVE V2

   Saves drafts when:
   - typing
   - refreshing
   - closing the tab
   - leaving the posting page
   - returning to the posting page later

   Drafts are only deleted after an actual post submission.
   ========================================================= */

(function () {
    "use strict";

    const STORAGE_PREFIX = "heatPostDraft:v2:";
    const PENDING_SUBMISSION_KEY =
        "heatPostDraftPendingSubmission:v2";

    const pageRoute =
        window.HEAT_PAGE_ROUTE || {};

    /*
     * Cleanup Pass 2: editor work belongs to posting routes. Topic
     * routes remain included only so a successful redirect can clear
     * the pending draft marker. Every other route exits immediately.
     */
    if (
        !pageRoute.isPosting &&
        !pageRoute.isTopic
    ) {
        return;
    }

    /*
     * This script is emitted after the native board markup.
     * Posting fields already exist when this route provides them,
     * so no DOMContentLoaded gate is required.
     */
    (function initializeHeatPostDraftAutosave() {

        const postBox = document.querySelector(
            'textarea[name="Post"], ' +
            'textarea[name="post"], ' +
            'textarea#Post'
        );

        /*
         * When the posting form successfully redirects to a
         * topic page, there will no longer be a post editor.
         * Only then do we remove the submitted draft.
         */

        if (!postBox) {

            const pendingSubmission =
                sessionStorage.getItem(
                    PENDING_SUBMISSION_KEY
                );

            if (pendingSubmission) {

                try {

                    const pending =
                        JSON.parse(pendingSubmission);

                    const isRecent =
                        pending &&
                        pending.key &&
                        Date.now() - pending.createdAt <
                            120000;

                    if (isRecent) {
                        localStorage.removeItem(
                            pending.key
                        );
                    }

                } catch (error) {
                    /* Invalid pending data. */
                }

                sessionStorage.removeItem(
                    PENDING_SUBMISSION_KEY
                );
            }

            return;
        }

        const postingForm =
            postBox.closest("form");
        const parameters =
            new URLSearchParams(
                window.location.search
            );


        /* =================================================
           READ FORM AND URL IDENTIFIERS
           ================================================= */

        function getFormValue(names) {

            if (!postingForm) {
                return "";
            }

            for (
                let index = 0;
                index < names.length;
                index += 1
            ) {

                const field =
                    postingForm.querySelector(
                        '[name="' +
                        names[index] +
                        '"]'
                    );

                if (
                    field &&
                    typeof field.value === "string" &&
                    field.value.trim()
                ) {
                    return field.value.trim();
                }
            }

            return "";
        }

        function getParameter(names) {

            for (
                let index = 0;
                index < names.length;
                index += 1
            ) {

                const value =
                    parameters.get(names[index]);

                if (value) {
                    return value;
                }
            }

            return "";
        }

        const topicID =
            getParameter([
                "t",
                "showtopic",
                "topic"
            ]) ||
            getFormValue([
                "t",
                "showtopic",
                "topic",
                "TopicID"
            ]);

        const forumID =
            getParameter([
                "f",
                "showforum",
                "forum"
            ]) ||
            getFormValue([
                "f",
                "showforum",
                "forum",
                "ForumID"
            ]);

        const postID =
            getParameter([
                "p",
                "pid",
                "post"
            ]) ||
            getFormValue([
                "p",
                "pid",
                "post",
                "PostID"
            ]);


        /* =================================================
           ACTIVE CHARACTER
           ================================================= */

        const accountElement =
            document.querySelector(
                "#heat-sidebar-character-username, " +
                ".heat-sidebar-username, " +
                "#heat-sidebar-character-name, " +
                ".heat-active-name"
            );

        const accountName =
            accountElement
                ? accountElement.textContent
                    .replace(/\s+/g, " ")
                    .trim()
                : "member";


        /* =================================================
           CREATE A STABLE DRAFT KEY

           This does not depend on the entire page URL, so
           the draft remains available when returning through
           a slightly different Jcink posting link.
           ================================================= */

        let draftContext;

        if (postID) {
            draftContext = "edit:" + postID;
        } else if (topicID) {
            draftContext = "topic:" + topicID;
        } else if (forumID) {
            draftContext = "forum:" + forumID;
        } else {
            draftContext =
                "page:" +
                window.location.pathname;
        }

        const draftKey =
            STORAGE_PREFIX +
            encodeURIComponent(accountName) +
            ":" +
            draftContext;


        /* =================================================
           TOPIC TITLE FIELD
           ================================================= */

        const subjectField =
            postingForm
                ? postingForm.querySelector(
                    'input[name="TopicTitle"], ' +
                    'input[name="title"], ' +
                    'input[name="subject"]'
                )
                : null;


        /* =================================================
           AUTOSAVE STATUS
           ================================================= */

        let status =
            document.getElementById(
                "heat-draft-status"
            );

        if (!status) {

            status =
                document.createElement("div");

            status.id =
                "heat-draft-status";

            status.setAttribute(
                "aria-live",
                "polite"
            );

            postBox.insertAdjacentElement(
                "afterend",
                status
            );
        }

        let statusTimer;

        function showStatus(
            message,
            className
        ) {

            window.clearTimeout(
                statusTimer
            );

            status.textContent =
                message;

            status.className =
                className || "";

            statusTimer =
                window.setTimeout(
                    function () {
                        status.textContent = "";
                        status.className = "";
                    },
                    2200
                );
        }


        /* =================================================
           RESTORE THE DRAFT

           The previous version only restored when Jcink's
           textarea was completely empty. Jcink can insert
           default or quoted content, which prevented the
           saved draft from appearing.

           This version restores the saved draft directly.
           ================================================= */

        function restoreDraft() {

            let savedDraft;

            try {

                const storedValue =
                    localStorage.getItem(
                        draftKey
                    );

                if (!storedValue) {
                    return;
                }

                savedDraft =
                    JSON.parse(storedValue);

            } catch (error) {

                localStorage.removeItem(
                    draftKey
                );

                return;
            }

            if (!savedDraft) {
                return;
            }

            let restored = false;

            if (
                typeof savedDraft.body ===
                    "string" &&
                savedDraft.body !==
                    postBox.value
            ) {

                postBox.value =
                    savedDraft.body;

                restored = true;
            }

            if (
                subjectField &&
                typeof savedDraft.subject ===
                    "string" &&
                savedDraft.subject !==
                    subjectField.value
            ) {

                subjectField.value =
                    savedDraft.subject;

                restored = true;
            }

            if (restored) {

                postBox.dispatchEvent(
                    new Event(
                        "change",
                        {
                            bubbles: true
                        }
                    )
                );

                showStatus(
                    "Draft restored",
                    "is-restored"
                );
            }
        }


        /* =================================================
           SAVE THE DRAFT
           ================================================= */

        function saveDraft(
            showConfirmation
        ) {

            const body =
                postBox.value;

            const subject =
                subjectField
                    ? subjectField.value
                    : "";

            /*
             * Only remove the draft when the user manually
             * empties both fields. Leaving the page will not
             * remove any written content.
             */

            if (
                !body.trim() &&
                !subject.trim()
            ) {

                localStorage.removeItem(
                    draftKey
                );

                return;
            }

            try {

                localStorage.setItem(
                    draftKey,
                    JSON.stringify({
                        body: body,
                        subject: subject,
                        updatedAt: Date.now()
                    })
                );

                if (showConfirmation) {

                    showStatus(
                        "Draft saved",
                        "is-saved"
                    );
                }

            } catch (error) {

                showStatus(
                    "Draft could not be saved"
                );
            }
        }

        let saveTimer;

        function scheduleSave() {

            window.clearTimeout(
                saveTimer
            );

            saveTimer =
                window.setTimeout(
                    function () {
                        saveDraft(true);
                    },
                    400
                );
        }


        /* =================================================
           RESTORE IMMEDIATELY
           ================================================= */

        restoreDraft();


        /*
         * A pending submission on an editor page means Jcink
         * returned to the form because of an error or preview.
         * Keep the draft.
         */

        if (
            sessionStorage.getItem(
                PENDING_SUBMISSION_KEY
            )
        ) {

            sessionStorage.removeItem(
                PENDING_SUBMISSION_KEY
            );
        }


        /* =================================================
           SAVE EVENTS
           ================================================= */

        postBox.addEventListener(
            "input",
            scheduleSave
        );

        postBox.addEventListener(
            "change",
            scheduleSave
        );

        if (subjectField) {

            subjectField.addEventListener(
                "input",
                scheduleSave
            );

            subjectField.addEventListener(
                "change",
                scheduleSave
            );
        }


        /*
         * Save before refreshing, closing the browser,
         * clicking away, or using the back button.
         */

        window.addEventListener(
            "pagehide",
            function () {
                saveDraft(false);
            }
        );

        window.addEventListener(
            "beforeunload",
            function () {
                saveDraft(false);
            }
        );

        document.addEventListener(
            "visibilitychange",
            function () {

                if (
                    document.visibilityState ===
                    "hidden"
                ) {
                    saveDraft(false);
                }
            }
        );


        /*
         * Restore again when returning through the browser's
         * back-forward cache.
         */

        window.addEventListener(
            "pageshow",
            function (event) {

                if (event.persisted) {
                    restoreDraft();
                }
            }
        );


        /* =================================================
           FINAL POST SUBMISSION

           Preview does not delete the draft.
           Add Reply, Post Topic, and Edit Post submissions
           are marked for deletion after Jcink redirects.
           ================================================= */

        if (postingForm) {

            postingForm.addEventListener(
                "submit",
                function (event) {

                    saveDraft(false);

                    const submitter =
                        event.submitter;

                    const submitText =
                        submitter
                            ? (
                                submitter.value ||
                                submitter.textContent ||
                                ""
                            )
                                .replace(/\s+/g, " ")
                                .trim()
                                .toLowerCase()
                            : "";

                    const isPreview =
                        submitText.includes(
                            "preview"
                        );

                    if (!isPreview) {

                        sessionStorage.setItem(
                            PENDING_SUBMISSION_KEY,
                            JSON.stringify({
                                key: draftKey,
                                createdAt:
                                    Date.now()
                            })
                        );
                    }
                }
            );
        }

    })();

})();
}

if (!(window.HEAT_ACCOUNT_ROUTE && window.HEAT_ACCOUNT_ROUTE.active)) {
(function () {
    "use strict";

    const HEAT = window.HEAT = window.HEAT || {};
    const compact = HEAT.compactMedia = HEAT.compactMedia || {};

    if (compact.initialized) {
        return;
    }

    compact.initialized = true;

    /*
     * Main-board tab scrolling shares this historical service block,
     * but it does not require any compact-media state or listeners.
     */
    initializeMainCardTabScrollers();

    const needsCompactMedia = Boolean(
        document.querySelector(
            ".heat-topic-row, " +
            ".heat-online-avatar[href], " +
            ".heat-visitor-item, " +
            "#heat-boardstats-source"
        )
    );

    /*
     * Cleanup Pass 2: topic/posting/account utility pages with no
     * compact-media consumers skip caches, load hooks, event hooks,
     * profile requests and DOMParser work entirely.
     */
    if (!needsCompactMedia) {
        return;
    }

    const CACHE_PREFIX = "heatCompactMedia:v5:profile:";
    const CACHE_MAX_AGE = 30 * 60 * 1000;
    const MAX_CONCURRENT_REQUESTS = 4;

    const profilePromises = new Map();
    const requestQueue = [];
    let activeRequests = 0;
    let scanTimer = 0;
    let pageLoadComplete =
        document.readyState === "complete";

    function profileIdFromHref(href) {
        const text = String(href || "");
        const match = text.match(
            /(?:showuser=|[?&](?:MID|mid)=)(\d+)/i
        );
        return match ? match[1] : "";
    }

    function normalizeUrl(value) {
        let raw = String(value || "")
            .replace(/&amp;/gi, "&")
            .replace(/^\s*\[img\]\s*/i, "")
            .replace(/\s*\[\/img\]\s*$/i, "")
            .trim();

        const cssUrl = raw.match(
            /url\(\s*['\"]?([^'\")]+)['\"]?\s*\)/i
        );
        if (cssUrl) {
            raw = cssUrl[1].trim();
        }

        const embedded = raw.match(
            /(https?:\/\/[^\s"'<>]+)/i
        );
        if (embedded) {
            raw = embedded[1];
        }

        if (!raw || /^(?:none|null|undefined|n\/a|-)$/i.test(raw)) {
            return "";
        }

        if (raw.startsWith("//")) {
            raw = window.location.protocol + raw;
        }

        try {
            const parsed = new URL(raw, window.location.href);
            if (
                parsed.protocol === "http:" ||
                parsed.protocol === "https:" ||
                parsed.protocol === "data:"
            ) {
                return parsed.href;
            }
        } catch (error) {
            return "";
        }

        return "";
    }

    function backgroundUrl(element) {
        if (!element) return "";

        const styleText = String(
            element.getAttribute("style") || ""
        );
        const match = styleText.match(
            /background-image\s*:\s*url\(\s*['\"]?([^'\")]+)['\"]?\s*\)/i
        );

        return match ? normalizeUrl(match[1]) : "";
    }

    function sourceUrl(source) {
        if (!source) return "";

        const image = source.querySelector("img[src]");
        if (image) {
            const value = normalizeUrl(image.getAttribute("src"));
            if (value) return value;
        }

        const link = source.querySelector("a[href]");
        if (link) {
            const value = normalizeUrl(link.getAttribute("href"));
            if (value) return value;
        }

        return normalizeUrl(source.textContent || source.innerHTML);
    }

    function mediaFromProfileDocument(doc) {
        if (!doc) {
            return { gif: "", avatar: "" };
        }

        const source = doc.querySelector(
            "[data-heat-compact-gif-source]"
        );

        const profileAvatar = doc.querySelector(
            ".heat-profile .heat-profile-avatar"
        );

        return {
            gif: sourceUrl(source),
            avatar: backgroundUrl(profileAvatar)
        };
    }

    function validPayload(payload) {
        if (!payload || typeof payload !== "object") {
            return null;
        }

        const savedAt = Number(payload.savedAt) || 0;
        if (!savedAt || Date.now() - savedAt > CACHE_MAX_AGE) {
            return null;
        }

        return {
            gif: normalizeUrl(payload.gif),
            avatar: normalizeUrl(payload.avatar),
            savedAt: savedAt
        };
    }

    function readCached(memberId) {
        if (!memberId) return null;

        const key = CACHE_PREFIX + memberId;

        function read(storage) {
            try {
                const raw = storage.getItem(key);
                if (!raw) return null;

                const payload = validPayload(JSON.parse(raw));
                if (!payload) {
                    storage.removeItem(key);
                }
                return payload;
            } catch (error) {
                try { storage.removeItem(key); } catch (ignore) {}
                return null;
            }
        }

        return read(sessionStorage) || read(localStorage);
    }

    function cache(memberId, media) {
        if (!memberId) return;

        const payload = JSON.stringify({
            gif: normalizeUrl(media && media.gif),
            avatar: normalizeUrl(media && media.avatar),
            savedAt: Date.now()
        });

        const key = CACHE_PREFIX + memberId;

        try { sessionStorage.setItem(key, payload); } catch (error) {}
        try { localStorage.setItem(key, payload); } catch (error) {}
    }

    function pumpQueue() {
        while (
            activeRequests < MAX_CONCURRENT_REQUESTS &&
            requestQueue.length
        ) {
            const job = requestQueue.shift();
            activeRequests += 1;

            fetch(job.href, {
                /*
                 * Compact media is public profile presentation data.
                 * Do not make the active member appear to visit every
                 * profile whose GIF/avatar is needed for a compact slot.
                 */
                credentials: "omit",
                cache: "force-cache"
            })
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("Profile media request failed.");
                    }
                    return response.text();
                })
                .then(function (html) {
                    const doc = new DOMParser().parseFromString(
                        html,
                        "text/html"
                    );
                    const media = mediaFromProfileDocument(doc);
                    cache(job.memberId, media);
                    job.resolve(media);
                })
                .catch(function () {
                    const empty = { gif: "", avatar: "" };
                    cache(job.memberId, empty);
                    job.resolve(empty);
                })
                .finally(function () {
                    activeRequests -= 1;
                    profilePromises.delete(job.cacheKey);
                    pumpQueue();
                });
        }
    }

    function requestProfileMedia(href, memberId) {
        const id = memberId || profileIdFromHref(href);
        const cached = readCached(id);

        if (cached) {
            return Promise.resolve(cached);
        }

        if (!href) {
            return Promise.resolve({ gif: "", avatar: "" });
        }

        const cacheKey = id || href;
        if (profilePromises.has(cacheKey)) {
            return profilePromises.get(cacheKey);
        }

        const promise = new Promise(function (resolve) {
            requestQueue.push({
                href: href,
                memberId: id,
                cacheKey: cacheKey,
                resolve: resolve
            });
            pumpQueue();
        });

        profilePromises.set(cacheKey, promise);
        return promise;
    }

    function loadableUrl(media, preference) {
        const gifUrl =
            normalizeUrl(media && media.gif);

        const avatarUrl =
            normalizeUrl(media && media.avatar);

        /*
         * Online Now uses the canonical profile PFP.
         * Other compact-media consumers keep their existing
         * Compact GIF -> avatar fallback contract.
         */
        const candidates =
            preference === "avatar"
                ? [avatarUrl, gifUrl]
                : [gifUrl, avatarUrl];

        const uniqueCandidates =
            candidates.filter(function (value, index, list) {
                return value && list.indexOf(value) === index;
            });

        return new Promise(function (resolve) {
            function tryNext(index) {
                if (index >= uniqueCandidates.length) {
                    resolve("");
                    return;
                }

                const image = new Image();
                image.decoding = "async";
                image.fetchPriority = "low";
                image.onload = function () {
                    resolve(uniqueCandidates[index]);
                };
                image.onerror = function () {
                    tryNext(index + 1);
                };
                image.src = uniqueCandidates[index];
            }

            tryNext(0);
        });
    }

    function applyUrl(target, url) {
        if (!target || !url) return false;

        if (target.matches(".heat-online-avatar")) {
            let image = target.querySelector(
                ":scope > .heat-compact-gif-layer"
            );

            if (!image) {
                image = document.createElement("img");
                image.className = "heat-compact-gif-layer";
                image.setAttribute("aria-hidden", "true");
                image.loading = "lazy";
                image.decoding = "async";
                image.fetchPriority = "low";
                target.appendChild(image);
            }

            image.src = url;
        } else {
            target.style.backgroundImage =
                'url("' + url.replace(/"/g, "\\\"") + '")';
            if (target.matches(".heat-visitor-avatar")) {
                target.classList.add("has-avatar");
            }
        }

        target.classList.add("has-compact-media");
        target.classList.remove("is-compact-media-pending");
        target.setAttribute("data-heat-compact-media", "ready");
        return true;
    }

    function decorate(target, href, memberId, preference) {
        if (!target || target.dataset.heatCompactMedia === "ready") {
            return Promise.resolve(false);
        }

        const id = memberId || profileIdFromHref(href);
        const requestKey = id || String(href || "");

        if (
            target.dataset.heatCompactRequest === requestKey &&
            target.classList.contains("is-compact-media-pending")
        ) {
            return Promise.resolve(false);
        }

        /*
         * Pass 8: cached media may be reused immediately, but uncached
         * profile requests must never compete with page loading.
         */
        const cached = readCached(id);

        if (!cached && !pageLoadComplete) {
            return Promise.resolve(false);
        }

        target.dataset.heatCompactRequest = requestKey;
        target.classList.add("is-compact-media-pending");

        const mediaPromise =
            cached
                ? Promise.resolve(cached)
                : requestProfileMedia(href, id);

        return mediaPromise
            .then(function (media) {
                return loadableUrl(
                    media,
                    preference
                );
            })
            .then(function (url) {
                if (url) {
                    return applyUrl(target, url);
                }

                target.classList.remove("is-compact-media-pending");
                target.setAttribute("data-heat-compact-media", "empty");
                return false;
            });
    }

    function profileLink(scope, selector) {
        if (!scope) return null;
        return scope.querySelector(selector);
    }

    function scan() {
        /*
         * Pass 8 FIX 1: Forum Row avatar ownership is native.
         * Forum Row renders |last_poster_avatar_url| directly,
         * so compact-media JS must never scan or overwrite it.
         */

        document
            .querySelectorAll(".heat-topic-row")
            .forEach(function (row) {
                const link = profileLink(
                    row,
                    '.heat-topic-last-poster a[href*="showuser="], ' +
                    '.heat-topic-last-poster a[href*="MID="], ' +
                    '.heat-topic-last-poster a[href*="mid="]'
                );
                const target = row.querySelector(
                    ".heat-topic-last-avatar-image"
                );

                if (link && target) {
                    decorate(target, link.href);
                }
            });

        document
            .querySelectorAll(".heat-online-avatar[href]")
            .forEach(function (link) {
                decorate(
                    link,
                    link.href,
                    link.getAttribute("data-online-member-id") || "",
                    "avatar"
                );
            });

        document
            .querySelectorAll(".heat-visitor-item")
            .forEach(function (item) {
                const target = item.querySelector(
                    ".heat-visitor-avatar"
                );
                const href =
                    item.href ||
                    item.getAttribute("href") ||
                    "";
                const memberId =
                    item.getAttribute("data-member-id") ||
                    profileIdFromHref(href);

                if (target && href) {
                    decorate(
                        target,
                        href,
                        memberId
                    );
                }
            });
    }

    function scheduleScan() {

        /*
         * Compact GIFs are progressive decoration, not first-paint layout.
         * Before the real window load completes, keep the normal avatar /
         * fallback media visible and postpone all profile/GIF work.
         */
        if (!pageLoadComplete) {
            return;
        }

        window.clearTimeout(scanTimer);
        scanTimer = window.setTimeout(scan, 45);
    }

    compact.decorate = decorate;
    compact.scan = scan;
    compact.readCached = readCached;
    compact.clear = function (memberId) {
        const key = CACHE_PREFIX + String(memberId || "");
        try { sessionStorage.removeItem(key); } catch (error) {}
        try { localStorage.removeItem(key); } catch (error) {}
    };

    function releaseCompactMediaAfterLoad() {
        pageLoadComplete = true;

        /*
         * Always do one post-load scan. If another HEAT service asked for a
         * scan earlier, this same pass satisfies it without duplicate work.
         */
        scheduleScan();
    }

    if (pageLoadComplete) {
        scheduleScan();
    } else {
        window.addEventListener(
            "load",
            releaseCompactMediaAfterLoad,
            { once: true }
        );
    }

    document.addEventListener(
        "heat:online-updated",
        scheduleScan
    );

    function initializeMainCardTabScrollers() {
        if (
            !document.body ||
            document.body.classList.contains("heat-subforum-page")
        ) {
            return;
        }

        document
            .querySelectorAll(".heat-forum-v2-subforums")
            .forEach(function (row) {
                if (row.dataset.heatTabScroller === "ready") {
                    return;
                }

                row.dataset.heatTabScroller = "ready";

                row.addEventListener(
                    "wheel",
                    function (event) {
                        if (row.scrollWidth <= row.clientWidth + 1) {
                            return;
                        }

                        const movement =
                            Math.abs(event.deltaX) > Math.abs(event.deltaY)
                                ? event.deltaX
                                : event.deltaY;

                        if (!movement) return;

                        event.preventDefault();
                        row.scrollLeft += movement;
                    },
                    { passive: false }
                );
            });
    }

})();
}

if (!(window.HEAT_ACCOUNT_ROUTE && window.HEAT_ACCOUNT_ROUTE.active)) {

/* =========================================================
   HEAT FOUNDATION — PHASE 10A NATIVE ONLINE NOW

   Presence authority:
   - Board Index: Jcink's server-rendered |online_list|
   - Profile route: Jcink's server-rendered |status| when available
   - Other routes: a short-lived cache of the last native Board Index snapshot
   - Active account: online immediately in the current authenticated page

   This service never polls and never requests Board Index from another route.
   ========================================================= */

(function () {
    "use strict";

    const HEAT =
        window.HEAT = window.HEAT || {};

    const online =
        HEAT.online = HEAT.online || {};

    const groups =
        HEAT.groups = HEAT.groups || {};

    if (online.initialized) {
        return;
    }

    online.initialized = true;
    online.members = [];
    online.membersById = new Map();
    online.membersByName = new Map();
    online.hasAuthoritativeSnapshot = false;
    online.snapshotSource = "";
    online.snapshotCapturedAt = 0;

    const ONLINE_CACHE_KEY =
        "heatOnlineSnapshot:v1";

    const ONLINE_CACHE_MAX_AGE =
        15 * 60 * 1000;

    const isBoardIndex =
        Boolean(
            document.querySelector(
                "#heat-boardstats-source"
            )
        );

    const GROUP_NAME_TO_ID =
        groups.nameToId = Object.assign(
            {},
            {
                guest: "2", guests: "2",
                member: "3", members: "3",
                admin: "4", admins: "4", staff: "4",
                administrator: "4", administrators: "4",
                adminstaff: "4", adminroot: "4",
                giveon: "6", rihanna: "7",
                beyonce: "8", beyonc: "8",
                drake: "9", pink: "10",
                loa: "11", leaveofabsence: "11",
                archived: "12", archive: "12",
                kendrick: "13", kendricklamar: "13",
                sza: "14", nasx: "15", lilnasx: "15",
                sam: "16", samsmith: "16",
                paramore: "17",
                summer: "18", summerwalker: "18",
                baby: "19", lilbaby: "19",
                doja: "20", dojacat: "20",
                flo: "21", flomilli: "21",
                cxh: "22", chloexhalle: "22", chlexhalle: "22",
                adele: "23", prince: "24",
                pnd: "25", partynextdoor: "25",
                brent: "26", brentfaiyaz: "26",
                meg: "27", megan: "27", megantheestallion: "27",
                lizzo: "28", burna: "29", burnaboy: "29",
                solange: "30", her: "31",
                chance: "32", chancetherapper: "32",
                silksonic: "34", silk: "34",
                wrath: "35", lust: "36", envy: "37",
                gluttony: "38", greed: "39", pride: "40", sloth: "41"
            },
            groups.nameToId || {},
            {
                flo: "21",
                flomilli: "21"
            }
        );


    const VALID_GROUP_IDS = new Set([
        "2", "3", "4",
        "6", "7", "8", "9", "10", "11", "12", "13",
        "14", "15", "16", "17", "18", "19", "20", "21",
        "22", "23", "24", "25", "26", "27", "28", "29",
        "30", "31", "32", "34", "35", "36", "37", "38",
        "39", "40", "41"
    ]);

    function cleanText(element) {
        return element
            ? element.textContent
                .replace(/\s+/g, " ")
                .trim()
            : "";
    }

    function normalizeName(value) {
        return String(value || "")
            .replace(/^@/, "")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }

    function normalizeGroupName(value) {
        return String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/&amp;/g, "and")
            .replace(/[^a-z0-9]+/g, "");
    }

    function validGroupId(value) {
        const id = String(value || "").trim();
        return VALID_GROUP_IDS.has(id) ? id : "";
    }

    function groupIdFromNode(node) {
        if (!node) {
            return "";
        }

        const candidates = [node].concat(
            Array.from(
                node.querySelectorAll
                    ? node.querySelectorAll(
                        '[data-heat-group-id], ' +
                        '[data-group-id], ' +
                        '[data-gid], ' +
                        '[data-group], ' +
                        '[class]'
                    )
                    : []
            )
        );

        for (const candidate of candidates) {
            if (!candidate || !candidate.getAttribute) {
                continue;
            }

            const direct = validGroupId(
                candidate.getAttribute("data-heat-group-id") ||
                candidate.getAttribute("data-group-id") ||
                candidate.getAttribute("data-gid")
            );

            if (direct) {
                return direct;
            }

            const namedData = GROUP_NAME_TO_ID[
                normalizeGroupName(
                    candidate.getAttribute("data-group") || ""
                )
            ];

            if (namedData) {
                return namedData;
            }

            if (!candidate.classList) {
                continue;
            }

            for (const className of candidate.classList) {
                const numericMatch =
                    className.match(/^(?:g|go|group)[-_]?(\d+)$/i);

                if (numericMatch) {
                    const numericId =
                        validGroupId(numericMatch[1]);

                    if (numericId) {
                        return numericId;
                    }
                }

                const namedId = GROUP_NAME_TO_ID[
                    normalizeGroupName(className)
                ];

                if (namedId) {
                    return namedId;
                }
            }
        }

        return "";
    }

    function memberIdFromHref(href) {
        if (!href) {
            return "";
        }

        try {
            const url = new URL(
                href,
                window.location.href
            );

            return (
                url.searchParams.get("showuser") ||
                url.searchParams.get("MID") ||
                url.searchParams.get("mid") ||
                ""
            );
        } catch (error) {
            return "";
        }
    }

    function getProfileLinks(scope) {
        if (!scope) {
            return [];
        }

        return Array.from(
            scope.querySelectorAll("a[href]")
        ).filter(function (link) {
            const href =
                link.getAttribute("href") || "";

            return /(?:showuser=|[?&](?:mid)=)/i
                .test(href);
        });
    }

    function nativeOnlineSource(scope) {
        return (scope || document).querySelector(
            '#heat-boardstats-source ' +
            '[data-heat-source="online-members"]'
        );
    }

    function extractOnlineMembers(source) {
        const members = new Map();

        getProfileLinks(source)
            .forEach(function (sourceLink) {
                const memberName =
                    cleanText(sourceLink);

                const sourceHref =
                    sourceLink.getAttribute("href");

                if (
                    !memberName ||
                    !sourceHref ||
                    memberName.toLowerCase() === "guest"
                ) {
                    return;
                }

                let profileUrl;

                try {
                    profileUrl = new URL(
                        sourceHref,
                        window.location.href
                    );
                } catch (error) {
                    return;
                }

                const memberId =
                    memberIdFromHref(profileUrl.href);

                const memberKey =
                    memberId ||
                    normalizeName(memberName) ||
                    profileUrl.href;

                if (members.has(memberKey)) {
                    return;
                }

                members.set(
                    memberKey,
                    {
                        id: memberId,
                        name: memberName,
                        href: profileUrl.href,
                        groupId: groupIdFromNode(sourceLink)
                    }
                );
            });

        return Array.from(members.values());
    }

    function getInitial(memberName) {
        const initialMatch =
            memberName.match(/[a-z0-9]/i);

        return initialMatch
            ? initialMatch[0].toUpperCase()
            : "•";
    }

    function currentMemberIdentity() {
        const identityNode =
            document.querySelector(
                "#heat-account-toggle[data-member-id], " +
                ".heat-sidebar-user[data-member-id], " +
                "#heat-browser[data-member-id]"
            );

        const memberId = String(
            identityNode &&
            identityNode.getAttribute("data-member-id") ||
            ""
        ).trim();

        const memberName =
            cleanText(
                document.querySelector(
                    ".heat-active-name"
                )
            ) ||
            cleanText(
                document.querySelector(
                    ".heat-sidebar-character-name"
                )
            );

        return {
            id: memberId,
            name: memberName
        };
    }

    function isCurrentMember(
        memberId,
        memberName
    ) {
        const current =
            currentMemberIdentity();

        if (
            current.id &&
            memberId &&
            String(current.id) === String(memberId)
        ) {
            return true;
        }

        const currentName =
            normalizeName(current.name);

        const targetName =
            normalizeName(memberName);

        return Boolean(
            currentName &&
            targetName &&
            currentName === targetName
        );
    }

    function snapshotState(
        memberId,
        memberName
    ) {
        if (!online.hasAuthoritativeSnapshot) {
            return null;
        }

        if (
            memberId &&
            online.membersById.has(String(memberId))
        ) {
            return true;
        }

        const normalizedName =
            normalizeName(memberName);

        if (
            normalizedName &&
            online.membersByName.has(normalizedName)
        ) {
            return true;
        }

        if (memberId || normalizedName) {
            return false;
        }

        return null;
    }

    function isOnline(memberId, memberName) {
        if (isCurrentMember(memberId, memberName)) {
            return true;
        }

        return snapshotState(
            memberId,
            memberName
        ) === true;
    }

    function profileNativeState(profile) {
        if (!profile) {
            return null;
        }

        let statusNode =
            profile.querySelector(
                ".heat-profile-native-status"
            );

        if (!statusNode) {
            const activityRows =
                profile.querySelectorAll(
                    ".heat-profile-activity-list > div"
                );

            for (const row of activityRows) {
                const label =
                    cleanText(
                        row.querySelector("span")
                    ).toLowerCase();

                if (label === "status") {
                    statusNode =
                        row.querySelector("strong");
                    break;
                }
            }
        }

        const statusText =
            cleanText(statusNode).toLowerCase();

        if (!statusText) {
            return null;
        }

        if (/\boffline\b/.test(statusText)) {
            return false;
        }

        if (/\bonline\b/.test(statusText)) {
            return true;
        }

        return null;
    }

    function setIndicatorState(
        indicator,
        memberId,
        memberName,
        forcedState
    ) {
        if (!indicator) {
            return;
        }

        let memberIsOnline =
            typeof forcedState === "boolean"
                ? forcedState
                : null;

        if (
            memberIsOnline === null &&
            isCurrentMember(memberId, memberName)
        ) {
            memberIsOnline = true;
        }

        if (memberIsOnline === null) {
            memberIsOnline = snapshotState(
                memberId,
                memberName
            );
        }

        indicator.classList.toggle(
            "is-online",
            memberIsOnline === true
        );

        indicator.classList.toggle(
            "is-offline",
            memberIsOnline === false
        );

        const readableName =
            String(memberName || "Member").trim() ||
            "Member";

        if (memberIsOnline === true) {
            indicator.title =
                readableName + " is online";
        } else if (memberIsOnline === false) {
            indicator.title =
                readableName + " is offline";
        } else {
            indicator.title =
                readableName + " status unavailable";
        }
    }

    function updateStatusIndicators() {
        const activeName =
            cleanText(
                document.querySelector(
                    ".heat-active-name"
                )
            ) ||
            cleanText(
                document.querySelector(
                    ".heat-sidebar-character-name"
                )
            );

        const currentMember =
            currentMemberIdentity();

        const activeId =
            currentMember.id ||
            memberIdFromHref(
                document.querySelector(
                    ".heat-sidebar-avatar[href]"
                )?.href
            );

        document
            .querySelectorAll(
                ".heat-active-online, " +
                ".heat-sidebar-online"
            )
            .forEach(function (indicator) {
                setIndicatorState(
                    indicator,
                    activeId,
                    activeName,
                    true
                );
            });

        document
            .querySelectorAll(".heat-profile")
            .forEach(function (profile) {
                setIndicatorState(
                    profile.querySelector(
                        ".heat-profile-online"
                    ),
                    profile.dataset.memberId || "",
                    cleanText(
                        profile.querySelector(
                            ".heat-profile-name"
                        )
                    ),
                    profileNativeState(profile)
                );
            });

        document
            .querySelectorAll(".heat-mini-online")
            .forEach(function (indicator) {
                const postRow =
                    indicator.closest(".heat-post-row");

                const profile =
                    (postRow &&
                        postRow.querySelector(
                            ".heat-mini-profile"
                        )) ||
                    indicator.closest(
                        ".heat-mini-profile"
                    );

                const profileLink =
                    indicator.closest(
                        '.heat-mini-avatar[href]'
                    ) ||
                    (postRow &&
                        postRow.querySelector(
                            '.heat-mini-avatar[href*="showuser="], ' +
                            '.heat-mini-avatar[href*="MID="]'
                        ));

                const nameScope =
                    postRow || profile;

                setIndicatorState(
                    indicator,
                    (profile &&
                        profile.dataset.memberId) ||
                        memberIdFromHref(
                            profileLink && profileLink.href
                        ),
                    cleanText(
                        nameScope &&
                        nameScope.querySelector(
                            ".heat-mini-name"
                        )
                    )
                );
            });

        document
            .querySelectorAll(".heat-post-status-dot")
            .forEach(function (indicator) {
                const postRow =
                    indicator.closest(".heat-post-row");

                const profile =
                    postRow &&
                    postRow.querySelector(
                        ".heat-mini-profile"
                    );

                const profileLink =
                    postRow &&
                    postRow.querySelector(
                        '.heat-mini-avatar[href*="showuser="], ' +
                        '.heat-mini-avatar[href*="MID="]'
                    );

                setIndicatorState(
                    indicator,
                    (profile &&
                        profile.dataset.memberId) ||
                        memberIdFromHref(
                            profileLink && profileLink.href
                        ),
                    cleanText(
                        postRow &&
                        postRow.querySelector(
                            ".heat-mini-name"
                        )
                    )
                );
            });

        document
            .querySelectorAll(
                document.body.classList.contains("heat-subforum-page")
                    ? ".heat-subforum-directory-card"
                    : ".heat-main-forum-card"
            )
            .forEach(function (forumCard) {
                const poster =
                    forumCard.querySelector(
                        ".heat-lastpost-author"
                    );

                const posterLink =
                    poster && poster.querySelector("a[href]");

                setIndicatorState(
                    forumCard.querySelector(
                        ".heat-lastpost-online"
                    ),
                    memberIdFromHref(
                        posterLink && posterLink.href
                    ),
                    cleanText(poster)
                );
            });

        document
            .querySelectorAll(".heat-topic-row")
            .forEach(function (row) {
                const poster =
                    row.querySelector(
                        ".heat-topic-last-poster"
                    );

                const posterLink =
                    poster && poster.querySelector("a[href]");

                setIndicatorState(
                    row.querySelector(
                        ".heat-topic-last-online"
                    ),
                    memberIdFromHref(
                        posterLink && posterLink.href
                    ),
                    cleanText(poster)
                );
            });

        document
            .querySelectorAll(".heat-visitor-item")
            .forEach(function (visitor) {
                setIndicatorState(
                    visitor.querySelector(
                        ".heat-visitor-dot"
                    ),
                    memberIdFromHref(visitor.href),
                    cleanText(
                        visitor.querySelector(
                            ".heat-visitor-name"
                        )
                    )
                );
            });
    }

    function clearPublishedMembers() {
        online.members = [];
        online.membersById.clear();
        online.membersByName.clear();
        online.hasAuthoritativeSnapshot = false;
        online.snapshotSource = "";
        online.snapshotCapturedAt = 0;
    }

    function cacheMembers(
        members,
        capturedAt
    ) {
        const snapshot = {
            version: 1,
            capturedAt: capturedAt,
            members: members.map(function (member) {
                return {
                    id: String(member.id || ""),
                    name: String(member.name || ""),
                    href: String(member.href || ""),
                    groupId: String(member.groupId || "")
                };
            })
        };

        try {
            window.localStorage.setItem(
                ONLINE_CACHE_KEY,
                JSON.stringify(snapshot)
            );
        } catch (error) {
            /* Storage is optional; native Board Index remains authoritative. */
        }
    }

    function readCachedMembers() {
        let rawSnapshot = "";

        try {
            rawSnapshot =
                window.localStorage.getItem(
                    ONLINE_CACHE_KEY
                ) || "";
        } catch (error) {
            return null;
        }

        if (!rawSnapshot) {
            return null;
        }

        try {
            const snapshot =
                JSON.parse(rawSnapshot);

            const capturedAt =
                Number(snapshot && snapshot.capturedAt);

            const members =
                snapshot &&
                Array.isArray(snapshot.members)
                    ? snapshot.members
                    : null;

            if (
                !capturedAt ||
                !members ||
                Date.now() - capturedAt >
                    ONLINE_CACHE_MAX_AGE
            ) {
                try {
                    window.localStorage.removeItem(
                        ONLINE_CACHE_KEY
                    );
                } catch (error) {
                    /* Ignore storage cleanup failures. */
                }

                return null;
            }

            return {
                capturedAt: capturedAt,
                members: members.map(function (member) {
                    return {
                        id: String(member.id || ""),
                        name: String(member.name || ""),
                        href: String(member.href || ""),
                        groupId: String(member.groupId || "")
                    };
                })
            };
        } catch (error) {
            return null;
        }
    }

    function publishMembers(
        members,
        source,
        capturedAt
    ) {
        const snapshotSource =
            source || "native-board-index";

        const snapshotTime =
            Number(capturedAt) || Date.now();

        online.members = members;
        online.membersById.clear();
        online.membersByName.clear();

        members.forEach(function (member) {
            if (member.id) {
                online.membersById.set(
                    String(member.id),
                    member
                );
            }

            const normalizedName =
                normalizeName(member.name);

            if (normalizedName) {
                online.membersByName.set(
                    normalizedName,
                    member
                );
            }
        });

        online.hasAuthoritativeSnapshot = true;
        online.snapshotSource = snapshotSource;
        online.snapshotCapturedAt = snapshotTime;

        if (snapshotSource === "native-board-index") {
            cacheMembers(
                members,
                snapshotTime
            );
        }

        updateStatusIndicators();

        document.dispatchEvent(
            new CustomEvent(
                "heat:online-updated",
                {
                    detail: {
                        members: members.slice(),
                        source: snapshotSource,
                        capturedAt: snapshotTime
                    }
                }
            )
        );
    }

    function renderMembers(
        avatarContainer,
        members
    ) {
        avatarContainer.innerHTML = "";

        if (!members.length) {
            const emptyMessage =
                document.createElement("span");

            emptyMessage.className =
                "heat-online-message";

            emptyMessage.textContent =
                "No members are online.";

            avatarContainer.appendChild(
                emptyMessage
            );

            return;
        }

        const memberFragment =
            document.createDocumentFragment();

        members.forEach(function (member) {
            const avatarLink =
                document.createElement("a");

            avatarLink.className =
                "heat-online-avatar";

            avatarLink.href = member.href;
            avatarLink.title =
                member.name + " is online";

            avatarLink.setAttribute(
                "aria-label",
                "View " +
                    member.name +
                    "'s profile"
            );

            avatarLink.setAttribute(
                "data-online-member",
                member.name
            );

            if (member.id) {
                avatarLink.setAttribute(
                    "data-online-member-id",
                    member.id
                );
            }

            const immediateGroupId =
                validGroupId(member.groupId);

            if (immediateGroupId) {
                avatarLink.setAttribute(
                    "data-heat-group-id",
                    immediateGroupId
                );
            } else {
                avatarLink.classList.add(
                    "is-group-pending"
                );
            }

            avatarLink.textContent =
                getInitial(member.name);

            if (
                HEAT.compactMedia &&
                typeof HEAT.compactMedia.decorate === "function"
            ) {
                HEAT.compactMedia.decorate(
                    avatarLink,
                    member.href,
                    member.id,
                    "avatar"
                );
            }

            memberFragment.appendChild(
                avatarLink
            );
        });

        avatarContainer.appendChild(
            memberFragment
        );
    }

    function readNativeOnlineMembers() {
        const source = nativeOnlineSource();

        if (!source) {
            return [];
        }

        return extractOnlineMembers(source);
    }

    function initializeNativeOnlineMembers() {
        const avatarContainer =
            document.querySelector(
                "#heat-online-avatars"
            );

        if (isBoardIndex) {
            const source = nativeOnlineSource();

            if (!source) {
                if (avatarContainer) {
                    avatarContainer.innerHTML =
                        '<span class="heat-online-message">' +
                        "Native online list unavailable." +
                        "</span>";
                }

                updateStatusIndicators();
                return;
            }

            const members =
                extractOnlineMembers(source);

            if (avatarContainer) {
                renderMembers(
                    avatarContainer,
                    members
                );
            }

            publishMembers(
                members,
                "native-board-index",
                Date.now()
            );

            return;
        }

        const cachedSnapshot =
            readCachedMembers();

        if (cachedSnapshot) {
            publishMembers(
                cachedSnapshot.members,
                "cached-board-index",
                cachedSnapshot.capturedAt
            );
        } else {
            clearPublishedMembers();
            updateStatusIndicators();
        }
    }

    online.refresh = function () {
        if (isBoardIndex) {
            const members =
                readNativeOnlineMembers();

            const avatarContainer =
                document.querySelector(
                    "#heat-online-avatars"
                );

            if (avatarContainer) {
                renderMembers(
                    avatarContainer,
                    members
                );
            }

            publishMembers(
                members,
                "native-board-index",
                Date.now()
            );

            return Promise.resolve(
                members.slice()
            );
        }

        const cachedSnapshot =
            readCachedMembers();

        if (cachedSnapshot) {
            publishMembers(
                cachedSnapshot.members,
                "cached-board-index",
                cachedSnapshot.capturedAt
            );

            return Promise.resolve(
                cachedSnapshot.members.slice()
            );
        }

        clearPublishedMembers();
        updateStatusIndicators();
        return Promise.resolve([]);
    };

    online.updateIndicators =
        updateStatusIndicators;

    online.isMemberOnline =
        isOnline;

    online.isOnline =
        isOnline;

    document.addEventListener(
        "heat:refresh-online-status",
        updateStatusIndicators
    );

    window.addEventListener(
        "storage",
        function (event) {
            if (event.key !== ONLINE_CACHE_KEY) {
                return;
            }

            if (isBoardIndex) {
                return;
            }

            const cachedSnapshot =
                readCachedMembers();

            if (cachedSnapshot) {
                publishMembers(
                    cachedSnapshot.members,
                    "cached-board-index",
                    cachedSnapshot.capturedAt
                );
            } else {
                clearPublishedMembers();
                updateStatusIndicators();
            }
        }
    );

    initializeNativeOnlineMembers();
})();
}

if (!(window.HEAT_ACCOUNT_ROUTE && window.HEAT_ACCOUNT_ROUTE.active)) {

/* =========================================================
   HEAT FIRST-PAINT PASS 5 — FIX 3 USERCP CURRENT LINK

   Inbox / Sent Items visual state is resolved in the head route
   preflight and styled before first paint. This controller remains
   only to add semantic aria-current state after native #ucpmenu exists,
   and to cover other UserCP routes that are not part of this visual fix.
   ========================================================= */

(function () {
    "use strict";

    const route = window.HEAT_PAGE_ROUTE || {};

    if (!route.isUserCP) {
        return;
    }

    const menu = document.getElementById("ucpmenu");

    if (!menu) {
        return;
    }

    const currentURL = new URL(
        window.location.href
    );

    const currentAction = String(route.action || "")
        .toLowerCase();
    const currentCode = String(route.code || "")
        .toLowerCase();
    const currentVID = String(
        currentURL.searchParams.get("VID") ||
        currentURL.searchParams.get("vid") ||
        ""
    ).toLowerCase();

    function cleanMenuLabel(link) {
        return String(link.textContent || "")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }

    function isInboxVID(value) {
        return (
            !value ||
            value === "in" ||
            value === "inbox"
        );
    }

    function isCurrentMessageLink(
        link,
        linkCode,
        linkVID
    ) {
        const label = cleanMenuLabel(link);

        const isInboxLink =
            label.includes("go to inbox") ||
            label === "inbox" ||
            (
                linkCode === "01" &&
                isInboxVID(linkVID) &&
                !label.includes("sent")
            );

        const isSentLink =
            label.includes("sent items") ||
            linkVID === "sent";

        /* Reading a PM still belongs to the Inbox section. */
        if (currentCode === "03") {
            return isInboxLink;
        }

        /* Inbox and Sent Items share Jcink's message-list route. */
        if (currentCode === "01") {
            if (isInboxVID(currentVID)) {
                return isInboxLink && !isSentLink;
            }

            return (
                linkCode === "01" &&
                linkVID === currentVID
            );
        }

        return linkCode === currentCode;
    }

    menu.querySelectorAll("a[href]").forEach(function (link) {
        try {
            const linkURL = new URL(
                link.href,
                window.location.href
            );

            const linkAction = String(
                linkURL.searchParams.get("act") || ""
            ).toLowerCase();

            const linkCode = String(
                linkURL.searchParams.get("CODE") ||
                linkURL.searchParams.get("code") ||
                ""
            ).toLowerCase();

            const linkVID = String(
                linkURL.searchParams.get("VID") ||
                linkURL.searchParams.get("vid") ||
                ""
            ).toLowerCase();

            let isCurrent = false;

            if (
                currentAction === "msg" &&
                linkAction === "msg"
            ) {
                isCurrent = isCurrentMessageLink(
                    link,
                    linkCode,
                    linkVID
                );
            } else {
                const sameAction =
                    linkAction === currentAction;

                const sameCode = currentCode
                    ? linkCode === currentCode
                    : !linkCode;

                isCurrent = sameAction && sameCode;
            }

            if (isCurrent) {
                link.setAttribute(
                    "aria-current",
                    "page"
                );
            } else {
                link.removeAttribute(
                    "aria-current"
                );
            }
        } catch (error) {
            /* Ignore malformed native links. */
        }
    });
})();
}

if (!(window.HEAT_ACCOUNT_ROUTE && window.HEAT_ACCOUNT_ROUTE.active)) {
(function () {
    "use strict";

    const HEAT = window.HEAT = window.HEAT || {};
    const groups = HEAT.groups = HEAT.groups || {};

    if (groups.visitorFallbackInitialized) {
        return;
    }

    groups.visitorFallbackInitialized = true;

    /*
     * Passive title cleanup is sitewide and cheap. The profile-fetch,
     * cache, queue and DOMParser fallback below exists solely for actual
     * Last Visitors cards, so routes without those cards stop here.
     */
    stripPassiveTextLinkTitles();

    if (!document.querySelector(".heat-visitor-item")) {
        const noVisitorRefresh = function () {};
        groups.refreshVisitors = noVisitorRefresh;
        groups.refresh = noVisitorRefresh;
        return;
    }

    /*
     * CLEANUP 03 PASS 3
     *
     * HEAT's normal group colors are native/CSS-owned. Forum rows,
     * Topic rows, Online Now, Seen Today, posts, profiles, and active
     * account surfaces are no longer profile-fetched for color.
     *
     * Last Visitors remains the one documented fallback because the
     * current Jcink visitor-data array supplies member id/name/avatar/date
     * but no native group class or group id in the live template.
     */

    const VALID_GROUP_IDS = new Set([
        "2", "3", "4",
        "6", "7", "8", "9", "10", "11", "12", "13",
        "14", "15", "16", "17", "18", "19", "20", "21",
        "22", "23", "24", "25", "26", "27", "28", "29",
        "30", "31", "32", "34", "35", "36", "37", "38",
        "39", "40", "41"
    ]);

    const CACHE_PREFIX = groups.cachePrefix || "heatGroupId:v6:rooted:";
    const CACHE_MAX_AGE = 10 * 60 * 1000;
    const profilePromises = new Map();
    const requestQueue = [];
    const MAX_REQUESTS = 2;
    let activeRequests = 0;

    function validId(value) {
        const id = String(value || "").trim();
        return VALID_GROUP_IDS.has(id) ? id : "";
    }

    function normalizeGroupName(value) {
        return String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/&amp;/g, "and")
            .replace(/[^a-z0-9]+/g, "");
    }

    function explicitGroupId(scope) {
        if (!scope) return "";

        const candidates = [scope].concat(
            Array.from(
                scope.querySelectorAll
                    ? scope.querySelectorAll(
                        '[data-heat-group-id], [data-group-id], ' +
                        '[data-gid], [data-group], [class]'
                    )
                    : []
            )
        );

        for (const candidate of candidates) {
            if (!candidate || !candidate.getAttribute) continue;

            const direct = validId(
                candidate.getAttribute("data-heat-group-id") ||
                candidate.getAttribute("data-group-id") ||
                candidate.getAttribute("data-gid")
            );

            if (direct) return direct;

            const namedData = groups.nameToId && groups.nameToId[
                normalizeGroupName(
                    candidate.getAttribute("data-group") || ""
                )
            ];

            if (namedData && validId(namedData)) {
                return validId(namedData);
            }

            if (!candidate.classList) continue;

            for (const className of candidate.classList) {
                const numeric = className.match(
                    /^(?:g|go|group)[-_]?(\d+)$/i
                );

                if (numeric && validId(numeric[1])) {
                    return validId(numeric[1]);
                }

                const named = groups.nameToId && groups.nameToId[
                    normalizeGroupName(className)
                ];

                if (named && validId(named)) {
                    return validId(named);
                }
            }
        }

        return "";
    }

    function profileIdFromHref(href) {
        if (!href) return "";

        try {
            const url = new URL(href, window.location.href);
            return (
                url.searchParams.get("showuser") ||
                url.searchParams.get("MID") ||
                url.searchParams.get("mid") ||
                ""
            );
        } catch (error) {
            return "";
        }
    }

    function readCachedGroup(memberId) {
        if (!memberId) return "";
        const key = CACHE_PREFIX + memberId;

        function read(storage) {
            try {
                const raw = storage.getItem(key);
                if (!raw) return "";
                const parsed = JSON.parse(raw);
                const id = validId(parsed && parsed.id);
                const savedAt = Number(parsed && parsed.savedAt) || 0;

                if (
                    !id ||
                    !savedAt ||
                    Date.now() - savedAt > CACHE_MAX_AGE
                ) {
                    storage.removeItem(key);
                    return "";
                }

                return id;
            } catch (error) {
                try { storage.removeItem(key); } catch (ignore) {}
                return "";
            }
        }

        return read(localStorage) || read(sessionStorage);
    }

    function cacheGroup(memberId, id) {
        const groupId = validId(id);
        if (!memberId || !groupId) return;

        const value = JSON.stringify({
            id: groupId,
            savedAt: Date.now()
        });

        const key = CACHE_PREFIX + memberId;
        try { localStorage.setItem(key, value); } catch (error) {}
        try { sessionStorage.setItem(key, value); } catch (error) {}
    }

    function applyGroup(item, id) {
        const groupId = validId(id);
        if (!item || !groupId) return false;

        item.setAttribute("data-heat-group-id", groupId);
        item.classList.remove("is-group-pending");
        item.removeAttribute("data-heat-group-state");
        return true;
    }

    function groupIdFromProfileDocument(doc, memberId) {
        if (!doc) return "";

        const rooted = doc.querySelector(
            '.heat-profile[data-group], ' +
            '.heat-profile[data-heat-group-id], ' +
            '.heat-mini-profile[data-group], ' +
            '.heat-mini-profile[data-heat-group-id]'
        );

        const rootedId = explicitGroupId(rooted);
        if (rootedId) return rootedId;

        if (memberId && window.CSS && typeof CSS.escape === "function") {
            const link = doc.querySelector(
                'a[href*="showuser=' + CSS.escape(memberId) + '"], ' +
                'a[href*="MID=' + CSS.escape(memberId) + '"]'
            );
            return explicitGroupId(link);
        }

        return "";
    }

    function pumpQueue() {
        while (activeRequests < MAX_REQUESTS && requestQueue.length) {
            const job = requestQueue.shift();
            activeRequests += 1;

            fetch(job.href, {
                /*
                 * Last Visitors needs only public profile group metadata.
                 * Keep the active member session out of fallback lookups.
                 */
                credentials: "omit",
                cache: "force-cache"
            })
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("Visitor profile group request failed.");
                    }
                    return response.text();
                })
                .then(function (html) {
                    const doc = new DOMParser().parseFromString(
                        html,
                        "text/html"
                    );
                    const id = groupIdFromProfileDocument(
                        doc,
                        job.memberId
                    );

                    if (id) {
                        cacheGroup(job.memberId, id);
                    }

                    job.resolve(id);
                })
                .catch(function () {
                    job.resolve("");
                })
                .finally(function () {
                    activeRequests -= 1;
                    profilePromises.delete(job.cacheKey);
                    pumpQueue();
                });
        }
    }

    function requestProfileGroup(link) {
        if (!link || !link.href) {
            return Promise.resolve("");
        }

        const memberId = profileIdFromHref(link.href);
        const cached = readCachedGroup(memberId);
        if (cached) return Promise.resolve(cached);

        const cacheKey = memberId || link.href;
        if (profilePromises.has(cacheKey)) {
            return profilePromises.get(cacheKey);
        }

        const promise = new Promise(function (resolve) {
            requestQueue.push({
                href: link.href,
                memberId: memberId,
                cacheKey: cacheKey,
                resolve: resolve
            });
            pumpQueue();
        });

        profilePromises.set(cacheKey, promise);
        return promise;
    }

    function resolveVisitor(item) {
        if (!item || item.dataset.heatVisitorGroupChecked === "true") {
            return;
        }

        item.dataset.heatVisitorGroupChecked = "true";

        const immediate = explicitGroupId(item);
        if (applyGroup(item, immediate)) return;

        const link = item.matches("a[href]")
            ? item
            : item.querySelector('a[href*="showuser="], a[href*="MID="]');

        if (!link || !link.href) return;

        const memberId = profileIdFromHref(link.href);
        const cached = readCachedGroup(memberId);

        if (applyGroup(item, cached)) return;

        item.classList.add("is-group-pending");
        item.setAttribute("data-heat-group-state", "pending");

        requestProfileGroup(link).then(function (id) {
            if (!applyGroup(item, id)) {
                item.setAttribute(
                    "data-heat-group-state",
                    "unresolved"
                );
            }
        });
    }

    function scanVisitors() {
        document
            .querySelectorAll(".heat-visitor-item")
            .forEach(resolveVisitor);
    }

    function stripPassiveTextLinkTitles() {
        document
            .querySelectorAll(
                ".heat-lastpost-topic a[title], " +
                ".heat-lastpost-author a[title], " +
                ".heat-topic-title a[title], " +
                ".heat-topic-starter a[title], " +
                ".heat-topic-last-poster a[title], " +
                ".heat-online-today-list a[title], " +
                ".heat-sidebar-character-name[title], " +
                ".heat-post-banner-slot .heat-mini-name a[title], " +
                ".heat-newest-member a[title], " +
                ".heat-mini-partner[title]"
            )
            .forEach(function (link) {
                link.removeAttribute("title");
            });
    }

    /*
     * This service also sits after the native board markup.
     * Run the static cleanup once now instead of repeating it at
     * DOMContentLoaded. Dynamic visitor inserts continue to use
     * the existing visitor refresh/event path.
     */
    scanVisitors();

    /* Compatibility hook, now intentionally visitor-only. */
    groups.refreshVisitors = scanVisitors;
    groups.refresh = scanVisitors;
})();
}

if (!(window.HEAT_ACCOUNT_ROUTE && window.HEAT_ACCOUNT_ROUTE.active)) {
(function () {
    "use strict";

    /* Cleanup Pass 2: post controls are absent outside topic output. */
    if (
        !document.querySelector(
            ".heat-post-reply, .heat-post-share"
        )
    ) {
        return;
    }

    if (window.HEAT_POST_ACTIONS_PHASE_1) {
        return;
    }

    window.HEAT_POST_ACTIONS_PHASE_1 = true;

    function cleanText(node) {
        return node
            ? node.textContent.replace(/\s+/g, " ").trim()
            : "";
    }

    function findNativeReplyControl(row) {
        if (!row) return null;

        const controls = Array.from(
            row.querySelectorAll(
                ".heat-post-header-actions a[href], " +
                ".heat-post-header-actions button, " +
                ".heat-post-header-actions input"
            )
        );

        return controls.find(function (control) {
            const label = [
                cleanText(control),
                control.getAttribute("title") || "",
                control.getAttribute("alt") || "",
                control.getAttribute("value") || "",
                control.querySelector("img")
                    ? control.querySelector("img").getAttribute("alt") || ""
                    : ""
            ].join(" ").toLowerCase();

            return (
                /\bquote\b|\breply\b/.test(label) &&
                !/multi/.test(label)
            );
        }) || null;
    }

    function findFastReplyField() {
        return document.querySelector(
            'textarea[name="Post"], ' +
            'textarea[name="post"], ' +
            'textarea#Post, ' +
            '.heat-fast-reply textarea'
        );
    }

    function focusFastReply() {
        const field = findFastReplyField();

        if (!field) return false;

        field.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        window.setTimeout(function () {
            field.focus({ preventScroll: true });
        }, 280);

        return true;
    }

    function initializeReply(button) {
        button.addEventListener("click", function () {
            const row = button.closest(".heat-post-row");
            const nativeControl = findNativeReplyControl(row);

            if (nativeControl) {
                nativeControl.click();
                return;
            }

            focusFastReply();
        });
    }

    function copyText(value) {
        if (
            navigator.clipboard &&
            typeof navigator.clipboard.writeText === "function" &&
            window.isSecureContext
        ) {
            return navigator.clipboard.writeText(value);
        }

        return new Promise(function (resolve, reject) {
            const helper = document.createElement("textarea");
            helper.value = value;
            helper.setAttribute("readonly", "");
            helper.style.position = "fixed";
            helper.style.opacity = "0";
            helper.style.pointerEvents = "none";
            document.body.appendChild(helper);
            helper.select();

            try {
                const copied = document.execCommand("copy");
                helper.remove();
                copied ? resolve() : reject(new Error("Copy failed"));
            } catch (error) {
                helper.remove();
                reject(error);
            }
        });
    }

    function initializeShare(button) {
        button.addEventListener("click", function (event) {
            const permalink = button.getAttribute("data-permalink") || "";
            const label = button.querySelector("small");
            const originalLabel = label ? label.textContent : "Share";

            if (!permalink) return;

            /*
             * Pass 9A: the Post Row keeps a real permalink href as the
             * no-JavaScript fallback. When this controller is active,
             * intercept the anchor so clicking Share copies instead of
             * navigating away before the clipboard Promise resolves.
             */
            event.preventDefault();

            let absoluteUrl = permalink;

            try {
                absoluteUrl = new URL(
                    permalink,
                    window.location.href
                ).href;
            } catch (error) {
                /* The native permalink is already a safe fallback. */
            }

            copyText(absoluteUrl)
                .then(function () {
                    button.classList.add("is-copied");
                    if (label) label.textContent = "Copied";

                    window.setTimeout(function () {
                        button.classList.remove("is-copied");
                        if (label) label.textContent = originalLabel;
                    }, 1800);
                })
                .catch(function () {
                    window.location.href = absoluteUrl;
                });
        });
    }

    function initialize() {
        document
            .querySelectorAll(".heat-post-reply")
            .forEach(initializeReply);

        document
            .querySelectorAll(".heat-post-share")
            .forEach(initializeShare);
    }

    /*
     * This script is at the end of body. Post action controls are already
     * parsed, so no DOMContentLoaded gate is needed.
     */
    initialize();
})();
}

if (!(window.HEAT_ACCOUNT_ROUTE && window.HEAT_ACCOUNT_ROUTE.active)) {
(function () {
    "use strict";

    const route =
        window.HEAT_PAGE_ROUTE || {};

    const isBoardIndex =
        Boolean(
            document.querySelector(
                "#heat-boardstats-source"
            )
        );

    if (isBoardIndex) {
        return;
    }

    const widget =
        document.querySelector(
            ".heat-os-utilities"
        );

    if (!widget) {
        return;
    }

    if (
        window.HEAT_EARLY_UI &&
        typeof window.HEAT_EARLY_UI
            .releaseFeature === "function"
    ) {
        window.HEAT_EARLY_UI.releaseFeature(
            "utilities"
        );
    }

    const html = document.documentElement;
    const utilityNames = [
        "tools",
        "reading",
        "scratchpad",
        "thread",
        "display",
        "session"
    ];

    function activeUtility() {
        const name = html.getAttribute(
            "data-heat-os-active"
        );

        return utilityNames.includes(name)
            ? name
            : "";
    }

    function collapsedUtilities(activeName) {
        return new Set(
            utilityNames.filter(function (name) {
                return name !== activeName;
            })
        );
    }

    function writeActiveUtility(name) {
        const safeName = utilityNames.includes(name)
            ? name
            : "";
        const collapsed =
            collapsedUtilities(safeName);
        const values = utilityNames.filter(
            function (utilityName) {
                return collapsed.has(utilityName);
            }
        );

        html.setAttribute(
            "data-heat-os-collapsed",
            values.join(" ")
        );

        html.setAttribute(
            "data-heat-os-active",
            safeName
        );

        try {
            window.localStorage.setItem(
                "heatOSUtilityTab:v2",
                safeName
            );
            window.localStorage.setItem(
                "heatOSUtilityState:v1",
                JSON.stringify(values)
            );
        } catch (error) {
            /* Current-page tab state still works. */
        }

        return safeName;
    }

    function syncUtilityCard(card, activeName) {
        if (!card) return;

        const name = card.getAttribute(
            "data-heat-os-utility"
        );
        const isActive = name === activeName;
        const toggle = card.querySelector(
            "[data-heat-os-toggle]"
        );
        const panel = card.querySelector(
            ".heat-os-utility-panel"
        );

        card.classList.toggle(
            "is-collapsed",
            !isActive
        );
        card.classList.toggle(
            "is-active",
            isActive
        );

        if (toggle) {
            const label =
                toggle.getAttribute(
                    "data-heat-os-label"
                ) || "utility";

            toggle.setAttribute(
                "aria-expanded",
                isActive ? "true" : "false"
            );
            toggle.setAttribute(
                "aria-pressed",
                isActive ? "true" : "false"
            );
            toggle.setAttribute(
                "aria-label",
                (isActive ? "Close " : "Open ") +
                    label
            );
        }

        if (panel) {
            panel.hidden = !isActive;
        }
    }

    function syncAllUtilityCards(activeName) {
        widget
            .querySelectorAll(
                "[data-heat-os-utility]"
            )
            .forEach(function (card) {
                syncUtilityCard(card, activeName);
            });

        widget.classList.toggle(
            "has-open-utility",
            Boolean(activeName)
        );

        const closeButton = widget.querySelector(
            '[data-heat-os-bulk="collapse"]'
        );

        if (closeButton) {
            closeButton.disabled = !activeName;
        }
    }

    let activeName = activeUtility();
    syncAllUtilityCards(activeName);

    widget
        .querySelectorAll("[data-heat-os-toggle]")
        .forEach(function (toggle) {
            toggle.addEventListener(
                "click",
                function () {
                    const name = toggle.getAttribute(
                        "data-heat-os-toggle"
                    );

                    if (!utilityNames.includes(name)) {
                        return;
                    }

                    activeName =
                        activeUtility() === name
                            ? ""
                            : name;

                    writeActiveUtility(activeName);
                    syncAllUtilityCards(activeName);
                }
            );

            toggle.addEventListener(
                "keydown",
                function (event) {
                    const buttons = Array.from(
                        widget.querySelectorAll(
                            "[data-heat-os-toggle]"
                        )
                    ).filter(function (button) {
                        return button.offsetParent !== null;
                    });
                    const currentIndex =
                        buttons.indexOf(toggle);
                    let nextIndex = null;

                    if (
                        !buttons.length ||
                        currentIndex < 0
                    ) {
                        return;
                    }

                    if (
                        event.key === "ArrowRight" ||
                        event.key === "ArrowDown"
                    ) {
                        nextIndex =
                            (currentIndex + 1) %
                            buttons.length;
                    }

                    if (
                        event.key === "ArrowLeft" ||
                        event.key === "ArrowUp"
                    ) {
                        nextIndex =
                            (currentIndex - 1 +
                                buttons.length) %
                            buttons.length;
                    }

                    if (event.key === "Home") {
                        nextIndex = 0;
                    }

                    if (event.key === "End") {
                        nextIndex = buttons.length - 1;
                    }

                    if (nextIndex === null) {
                        return;
                    }

                    event.preventDefault();

                    const nextButton =
                        buttons[nextIndex];

                    activeName =
                        nextButton.getAttribute(
                            "data-heat-os-toggle"
                        );

                    writeActiveUtility(activeName);
                    syncAllUtilityCards(activeName);
                    nextButton.focus();
                }
            );
        });

    widget
        .querySelectorAll("[data-heat-os-bulk]")
        .forEach(function (button) {
            button.addEventListener(
                "click",
                function () {
                    activeName = "";

                    writeActiveUtility(activeName);
                    syncAllUtilityCards(activeName);
                }
            );
        });

    const status =
        widget.querySelector(
            "[data-heat-page-tools-status]"
        );

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function copyText(value) {
        if (
            navigator.clipboard &&
            typeof navigator.clipboard.writeText === "function" &&
            window.isSecureContext
        ) {
            return navigator.clipboard.writeText(value);
        }

        return new Promise(function (resolve, reject) {
            const helper =
                document.createElement("textarea");

            helper.value = value;
            helper.setAttribute("readonly", "");
            helper.style.position = "fixed";
            helper.style.opacity = "0";
            helper.style.pointerEvents = "none";

            document.body.appendChild(helper);
            helper.select();

            try {
                const copied =
                    document.execCommand("copy");

                helper.remove();

                copied
                    ? resolve()
                    : reject(
                        new Error("Copy failed")
                    );
            } catch (error) {
                helper.remove();
                reject(error);
            }
        });
    }

    const topButtons = Array.from(
        widget.querySelectorAll(
            '[data-heat-page-tool="top"]'
        )
    );

    const bottomButtons = Array.from(
        widget.querySelectorAll(
            '[data-heat-page-tool="bottom"]'
        )
    );

    const copyButton =
        widget.querySelector(
            '[data-heat-page-tool="copy"]'
        );

    const forumLink =
        widget.querySelector(
            '[data-heat-page-tool="forum"]'
        );

    function topicStartTarget() {
        if (!route.isTopic) return null;

        const topicTitle =
            document.querySelector(
                "#innerwrapper .maintitle .topic-title"
            );

        if (topicTitle) {
            return (
                topicTitle.closest(".maintitle") ||
                topicTitle
            );
        }

        return (
            Array.from(
                document.querySelectorAll(
                    "article.heat-post-row"
                )
            ).find(function (row) {
                return (
                    !row.hidden &&
                    row.offsetParent !== null
                );
            }) ||
            document.querySelector(
                "[data-heat-comm], .heat-comm"
            ) ||
            document.getElementById("innerwrapper")
        );
    }

    function scrollToPageOrTopicStart() {
        const target = topicStartTarget();

        if (!target) {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            return;
        }

        const targetTop =
            target.getBoundingClientRect().top +
            window.scrollY -
            18;

        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth"
        });
    }

    function scrollToPageBottom() {
        const footer =
            document.getElementById(
                "heat-footer"
            );

        if (footer) {
            footer.scrollIntoView({
                behavior: "smooth",
                block: "end"
            });
            return;
        }

        window.scrollTo({
            top:
                document.documentElement
                    .scrollHeight,
            behavior: "smooth"
        });
    }

    topButtons.forEach(function (topButton) {
        topButton.addEventListener(
            "click",
            function () {
                scrollToPageOrTopicStart();

                setStatus(
                    route.isTopic
                        ? "Heading to the thread start."
                        : "Heading to the top."
                );
            }
        );
    });

    bottomButtons.forEach(function (bottomButton) {
        bottomButton.addEventListener(
            "click",
            function () {
                scrollToPageBottom();

                setStatus(
                    "Heading to the bottom."
                );
            }
        );
    });

    if (copyButton) {
        copyButton.addEventListener(
            "click",
            function () {
                const label =
                    copyButton.querySelector(
                        "[data-heat-page-tool-copy-label]"
                    );

                copyText(
                    window.location.href
                )
                    .then(function () {
                        if (label) {
                            label.textContent =
                                "Copied";
                        }

                        setStatus(
                            "Page link copied."
                        );

                        window.setTimeout(
                            function () {
                                if (label) {
                                    label.textContent =
                                        "Copy Link";
                                }
                            },
                            1600
                        );
                    })
                    .catch(function () {
                        setStatus(
                            "Copy was blocked by the browser."
                        );
                    });
            }
        );
    }

    if (route.isTopic && forumLink) {
        const forumLinks =
            Array.from(
                document.querySelectorAll(
                    '#navi a[href*="showforum=" i]'
                )
            );

        const nativeForum =
            forumLinks[
                forumLinks.length - 1
            ];

        if (
            nativeForum &&
            nativeForum.getAttribute("href")
        ) {
            forumLink.setAttribute(
                "href",
                nativeForum.getAttribute("href")
            );
        }
    }


    /* =====================================================
       TOPIC READING PROGRESS
       ===================================================== */

    function initializeReadingProgress() {
        if (!route.isTopic) return;

        if (
            window.HEAT_EARLY_UI &&
            typeof window.HEAT_EARLY_UI
                .releaseReadingProgress === "function"
        ) {
            window.HEAT_EARLY_UI
                .releaseReadingProgress();
        }

        const progress = widget.querySelector(
            "[data-heat-reading-progress]"
        );
        const percentLabel = widget.querySelector(
            "[data-heat-reading-percent]"
        );
        const countLabel = widget.querySelector(
            "[data-heat-reading-count]"
        );
        const summary = widget.querySelector(
            "[data-heat-reading-summary]"
        );

        if (!progress) return;
        const progressFill =
            progress.querySelector(":scope > span") ||
            progress.firstElementChild;
        const visibleRatios = new Map();
        let lastActiveIndex = -1;

        function visiblePostRows() {
            return Array.from(
                document.querySelectorAll(
                    "article.heat-post-row"
                )
            ).filter(function (row) {
                return (
                    !row.hidden &&
                    !row.classList.contains(
                        "heat-comm-hidden-reply"
                    )
                );
            });
        }

        const rows = visiblePostRows();

        function renderActivePost(activeIndex) {
            if (!rows.length) {
                progress.setAttribute("aria-valuenow", "0");
                progress.setAttribute(
                    "aria-valuetext",
                    "Conversation view"
                );

                if (progressFill) {
                    progressFill.style.transform =
                        "scaleX(0)";
                }

                if (percentLabel) {
                    percentLabel.textContent = "0%";
                }

                if (summary) {
                    summary.textContent = "0%";
                }

                if (countLabel) {
                    countLabel.textContent =
                        "Conversation view";
                }

                return;
            }

            const safeIndex = Math.max(
                0,
                Math.min(rows.length - 1, activeIndex)
            );

            if (safeIndex === lastActiveIndex) {
                return;
            }

            lastActiveIndex = safeIndex;

            /*
             * Performance pass: this meter is deliberately post-based.
             * It no longer reads scrollY/DOM geometry or rewrites text on
             * every scroll tick. The trace showed those tiny sidebar writes
             * repeatedly invalidating layout for the entire topic document.
             */
            const percent = Math.round(
                ((safeIndex + 1) / rows.length) * 100
            );
            const countText =
                "Post " +
                (safeIndex + 1) +
                " of " +
                rows.length;

            if (progressFill) {
                progressFill.style.transform =
                    "scaleX(" +
                    (percent / 100).toFixed(2) +
                    ")";
            }

            progress.setAttribute(
                "aria-valuenow",
                String(percent)
            );
            progress.setAttribute(
                "aria-valuetext",
                countText
            );

            if (percentLabel) {
                percentLabel.textContent =
                    percent + "%";
            }

            if (summary) {
                summary.textContent =
                    percent + "%";
            }

            if (countLabel) {
                countLabel.textContent = countText;
            }
        }

        renderActivePost(0);

        if (
            rows.length < 2 ||
            typeof window.IntersectionObserver !==
                "function"
        ) {
            return;
        }

        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        visibleRatios.set(
                            entry.target,
                            entry.intersectionRatio
                        );
                    } else {
                        visibleRatios.delete(entry.target);
                    }
                });

                let nextIndex = lastActiveIndex;
                let bestRatio = -1;

                rows.forEach(function (row, index) {
                    const ratio =
                        visibleRatios.get(row);

                    if (
                        typeof ratio === "number" &&
                        ratio > bestRatio
                    ) {
                        bestRatio = ratio;
                        nextIndex = index;
                    }
                });

                if (nextIndex >= 0) {
                    renderActivePost(nextIndex);
                }
            },
            {
                root: null,
                rootMargin: "-32% 0px -48% 0px",
                threshold: [0, 0.01, 0.1, 0.25, 0.5]
            }
        );

        rows.forEach(function (row) {
            observer.observe(row);
        });
    }


    /* =====================================================
       PER-CHARACTER LOCAL SCRATCHPAD
       ===================================================== */

    function initializeScratchpad() {
        const textarea = widget.querySelector(
            "[data-heat-scratchpad]"
        );

        if (!textarea) return;

        const activeCharacter =
            document.querySelector(
                ".heat-sidebar-user"
            );
        const memberId = String(
            activeCharacter &&
            activeCharacter.getAttribute(
                "data-member-id"
            ) || ""
        ).trim();
        const memberName = String(
            document.querySelector(
                "#heat-sidebar-character-name"
            )?.textContent || "guest"
        )
            .replace(/\s+/g, " ")
            .trim();
        const identity =
            /^\d+$/.test(memberId)
                ? "member-" + memberId
                : "name-" +
                    memberName
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-");
        const storageKey =
            "heatScratchpad:v1:" + identity;
        const scratchStatus = widget.querySelector(
            "[data-heat-scratchpad-status]"
        );
        const counter = widget.querySelector(
            "[data-heat-scratchpad-count]"
        );
        const summary = widget.querySelector(
            "[data-heat-scratchpad-summary]"
        );
        const prompts = [
            "What does your character want right now?",
            "Name the tension underneath this scene.",
            "Add one sensory detail to the setting.",
            "Give the other writer a clear opening.",
            "What changes by the end of this post?",
            "Write the line your character almost says."
        ];

        function setScratchStatus(message) {
            if (scratchStatus) {
                scratchStatus.textContent = message;
            }
        }

        function updateScratchMeta() {
            const length = textarea.value.length;

            if (counter) {
                counter.textContent =
                    length + " / 1000";
            }

            if (summary) {
                summary.textContent = length
                    ? length + " chars"
                    : "Empty";
            }
        }

        if (
            !textarea.hasAttribute(
                "data-heat-early-mounted"
            )
        ) {
            try {
                textarea.value =
                    window.localStorage.getItem(
                        storageKey
                    ) || "";
            } catch (error) {
                setScratchStatus(
                    "Local storage is unavailable."
                );
            }
        }

        updateScratchMeta();

        textarea.addEventListener(
            "input",
            function () {
                updateScratchMeta();
                setScratchStatus(
                    "Unsaved changes."
                );
            }
        );

        widget
            .querySelectorAll(
                "[data-heat-scratchpad-action]"
            )
            .forEach(function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        const action = button.getAttribute(
                            "data-heat-scratchpad-action"
                        );

                        if (action === "save") {
                            try {
                                window.localStorage.setItem(
                                    storageKey,
                                    textarea.value
                                );
                                setScratchStatus(
                                    "Saved for " +
                                    memberName +
                                    "."
                                );
                            } catch (error) {
                                setScratchStatus(
                                    "Scratchpad could not be saved."
                                );
                            }
                            return;
                        }

                        if (action === "clear") {
                            const shouldClear =
                                !textarea.value ||
                                window.confirm(
                                    "Clear this character's HEAT Scratchpad?"
                                );

                            if (!shouldClear) return;

                            textarea.value = "";

                            try {
                                window.localStorage.removeItem(
                                    storageKey
                                );
                            } catch (error) {}

                            updateScratchMeta();
                            setScratchStatus(
                                "Scratchpad cleared."
                            );
                            return;
                        }

                        if (action === "prompt") {
                            const prompt = prompts[
                                Math.floor(
                                    Math.random() *
                                    prompts.length
                                )
                            ];
                            const prefix = textarea.value.trim()
                                ? "\n\n"
                                : "";
                            const addition =
                                prefix +
                                "Prompt: " +
                                prompt;
                            const remaining =
                                textarea.maxLength -
                                textarea.value.length;

                            textarea.value +=
                                addition.slice(
                                    0,
                                    Math.max(0, remaining)
                                );

                            textarea.focus();
                            updateScratchMeta();
                            setScratchStatus(
                                "Prompt added."
                            );
                        }
                    }
                );
            });
    }


    /* =====================================================
       THREAD INFO FROM CURRENT DOM ONLY
       ===================================================== */

    function initializeThreadInfo() {
        if (!route.isTopic) return;

        const rows = Array.from(
            document.querySelectorAll(
                "article.heat-post-row"
            )
        );
        const participantSlot = widget.querySelector(
            "[data-heat-thread-participants]"
        );
        const starterSlot = widget.querySelector(
            "[data-heat-thread-starter]"
        );
        const pageSlot = widget.querySelector(
            "[data-heat-thread-page]"
        );
        const summary = widget.querySelector(
            "[data-heat-thread-summary]"
        );

        function numericPage(node) {
            const match = String(
                node && node.textContent || ""
            ).match(/\d+/);

            return match
                ? parseInt(match[0], 10) || 0
                : 0;
        }

        const currentNode =
            document.querySelector(
                ".pagination .pagination_current"
            );
        const pageNodes = Array.from(
            document.querySelectorAll(
                ".pagination a, " +
                ".pagination .pagination_current"
            )
        );
        const pageNumbers = pageNodes
            .map(numericPage)
            .filter(Boolean);
        const currentPage =
            numericPage(currentNode) || 1;
        const totalPages = Math.max(
            currentPage,
            pageNumbers.length
                ? Math.max.apply(null, pageNumbers)
                : 1
        );

        if (pageSlot) {
            pageSlot.textContent =
                "Page " +
                currentPage +
                " of " +
                totalPages;
        }

        function authorName(row) {
            return String(
                row &&
                row.querySelector(
                    ".heat-post-banner-slot .heat-mini-name, " +
                    ".heat-mini-name"
                )?.textContent || ""
            )
                .replace(/\s+/g, " ")
                .trim();
        }

        const participants = new Map();

        rows.forEach(function (row) {
            const name = authorName(row);
            const key = name.toLowerCase();

            if (name && !participants.has(key)) {
                participants.set(key, {
                    name: name,
                    row: row
                });
            }
        });

        if (starterSlot) {
            starterSlot.textContent = "";

            if (currentPage === 1 && rows.length) {
                starterSlot.textContent =
                    authorName(rows[0]) ||
                    "First visible author";
            } else {
                const firstPageLink =
                    pageNodes.find(function (node) {
                        return numericPage(node) === 1;
                    });
                const link =
                    document.createElement("a");

                link.href = firstPageLink
                    ? firstPageLink.href
                    : (function () {
                        const url = new URL(
                            window.location.href
                        );
                        url.searchParams.delete("st");
                        return url.href;
                    })();
                link.textContent = "See page 1";
                starterSlot.appendChild(link);
            }
        }

        if (participantSlot) {
            participantSlot.innerHTML = "";

            if (!participants.size) {
                participantSlot.textContent =
                    "No visible participants found.";
            } else {
                participants.forEach(function (participant) {
                    const button =
                        document.createElement("button");

                    button.type = "button";
                    button.className =
                        "heat-thread-participant";
                    button.textContent =
                        participant.name;
                    button.title =
                        "Jump to " +
                        participant.name +
                        "'s first visible post";

                    button.addEventListener(
                        "click",
                        function () {
                            participant.row.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });
                        }
                    );

                    participantSlot.appendChild(button);
                });
            }
        }

        if (summary) {
            summary.textContent =
                participants.size +
                (participants.size === 1
                    ? " writer"
                    : " writers");
        }
    }


    /* =====================================================
       POST-BODY DISPLAY SIZE
       ===================================================== */

    function initializeDisplayControls() {
        const buttons = Array.from(
            widget.querySelectorAll(
                "[data-heat-post-text-size]"
            )
        );
        const summary = widget.querySelector(
            "[data-heat-display-summary]"
        );
        const labels = {
            compact: "Compact",
            default: "Default",
            comfortable: "Comfort"
        };
        const sizeFactors = {
            compact: 0.9,
            default: 1,
            comfortable: 1.16
        };
        const textTargets = new Map();

        function hasDirectReadableText(element) {
            return Array.from(
                element.childNodes
            ).some(function (node) {
                return (
                    node.nodeType === 3 &&
                    node.nodeValue.trim() !== ""
                );
            });
        }

        function isResizableTextTarget(element) {
            if (
                element.matches(
                    [
                        "script",
                        "style",
                        "noscript",
                        "svg",
                        "canvas",
                        "iframe",
                        "object",
                        "embed",
                        "input",
                        "select",
                        "textarea",
                        "option",
                        "button"
                    ].join(",")
                )
            ) {
                return false;
            }

            return (
                element.classList.contains(
                    "heat-post-copy"
                ) ||
                element.classList.contains(
                    "postcolor"
                ) ||
                hasDirectReadableText(element)
            );
        }

        function restoreTrackedFontSizes() {
            textTargets.forEach(
                function (details, element) {
                    if (details.inlineValue) {
                        element.style.setProperty(
                            "font-size",
                            details.inlineValue,
                            details.inlinePriority
                        );
                    } else {
                        element.style.removeProperty(
                            "font-size"
                        );
                    }
                }
            );
        }

        function captureTextTargets() {
            document
                .querySelectorAll(
                    ".heat-post-copy, " +
                    ".heat-post-copy *"
                )
                .forEach(function (element) {
                    if (
                        textTargets.has(element) ||
                        !isResizableTextTarget(element)
                    ) {
                        return;
                    }

                    const baseline = parseFloat(
                        window.getComputedStyle(
                            element
                        ).fontSize
                    );

                    if (!Number.isFinite(baseline)) {
                        return;
                    }

                    textTargets.set(element, {
                        baseline: baseline,
                        inlineValue:
                            element.style.getPropertyValue(
                                "font-size"
                            ),
                        inlinePriority:
                            element.style.getPropertyPriority(
                                "font-size"
                            )
                    });
                });
        }

        function resizePostText(size) {
            const factor =
                sizeFactors[size] ||
                sizeFactors.default;

            textTargets.forEach(
                function (details, element) {
                    if (factor === 1) {
                        if (details.inlineValue) {
                            element.style.setProperty(
                                "font-size",
                                details.inlineValue,
                                details.inlinePriority
                            );
                        } else {
                            element.style.removeProperty(
                                "font-size"
                            );
                        }
                        return;
                    }

                    element.style.setProperty(
                        "font-size",
                        (
                            details.baseline * factor
                        ).toFixed(3) + "px",
                        "important"
                    );
                }
            );
        }

        function applySize(size, persist) {
            const safeSize = labels[size]
                ? size
                : "default";

            /*
             * Default is already the CSS-owned first-paint state. Do not
             * scan every descendant or call getComputedStyle until a reader
             * explicitly asks for Compact/Comfort. On the recorded showcase
             * topic, the old unconditional scan blocked rendering for 447ms.
             */
            if (safeSize === "default") {
                restoreTrackedFontSizes();
            } else {
                html.setAttribute(
                    "data-heat-post-text-size",
                    "default"
                );
                restoreTrackedFontSizes();
                captureTextTargets();
                resizePostText(safeSize);
            }

            html.setAttribute(
                "data-heat-post-text-size",
                safeSize
            );

            buttons.forEach(function (button) {
                button.setAttribute(
                    "aria-pressed",
                    button.getAttribute(
                        "data-heat-post-text-size"
                    ) === safeSize
                        ? "true"
                        : "false"
                );
            });

            if (summary) {
                summary.textContent = labels[safeSize];
            }

            if (persist) {
                try {
                    window.localStorage.setItem(
                        "heatPostTextSize:v1",
                        safeSize
                    );
                } catch (error) {}
            }
        }

        if (
            window.HEAT_EARLY_UI &&
            typeof window.HEAT_EARLY_UI
                .setDisplayApplier === "function"
        ) {
            window.HEAT_EARLY_UI
                .setDisplayApplier(applySize);
        }

        applySize(
            html.getAttribute(
                "data-heat-post-text-size"
            ) || "default",
            false
        );

        buttons.forEach(function (button) {
            button.addEventListener(
                "click",
                function () {
                    applySize(
                        button.getAttribute(
                            "data-heat-post-text-size"
                        ),
                        true
                    );
                }
            );
        });
    }


    /* =====================================================
       LOCAL HEAT SESSION
       ===================================================== */

    function initializeSession() {
        const sessionKey = "heatSession:v1";
        const pageSignature =
            window.location.pathname +
            window.location.search;
        const now = Date.now();
        let session = {
            startedAt: now,
            pagesVisited: 0,
            lastPage: "",
            threads: []
        };

        try {
            const savedSession = JSON.parse(
                window.sessionStorage.getItem(
                    sessionKey
                ) || "null"
            );

            if (
                savedSession &&
                Number(savedSession.startedAt) > 0
            ) {
                session = {
                    startedAt:
                        Number(savedSession.startedAt),
                    pagesVisited:
                        Math.max(
                            0,
                            Number(
                                savedSession.pagesVisited
                            ) || 0
                        ),
                    lastPage:
                        String(
                            savedSession.lastPage || ""
                        ),
                    threads:
                        Array.isArray(
                            savedSession.threads
                        )
                            ? savedSession.threads
                                .map(String)
                                .slice(0, 250)
                            : []
                };
            }
        } catch (error) {}

        if (session.lastPage !== pageSignature) {
            session.pagesVisited += 1;
            session.lastPage = pageSignature;
        }

        let topicId = "";

        new URLSearchParams(
            window.location.search
        ).forEach(function (value, key) {
            if (
                !topicId &&
                String(key).toLowerCase() ===
                    "showtopic"
            ) {
                topicId = String(value || "");
            }
        });

        if (
            topicId &&
            !session.threads.includes(topicId)
        ) {
            session.threads.push(topicId);
        }

        try {
            window.sessionStorage.setItem(
                sessionKey,
                JSON.stringify(session)
            );
        } catch (error) {}

        const timeSlot = widget.querySelector(
            "[data-heat-session-time]"
        );
        const pagesSlot = widget.querySelector(
            "[data-heat-session-pages]"
        );
        const threadsSlot = widget.querySelector(
            "[data-heat-session-threads]"
        );
        const sinceSlot = widget.querySelector(
            "[data-heat-session-since]"
        );
        const summary = widget.querySelector(
            "[data-heat-session-summary]"
        );
        const sessionCard = widget.querySelector(
            '[data-heat-os-utility="session"]'
        );
        const sessionTimeFormatter =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    hour: "numeric",
                    minute: "2-digit"
                }
            );

        function elapsedLabel() {
            const elapsedMinutes = Math.max(
                0,
                Math.floor(
                    (Date.now() - session.startedAt) /
                    60000
                )
            );

            if (elapsedMinutes < 60) {
                return elapsedMinutes + "m";
            }

            const hours = Math.floor(
                elapsedMinutes / 60
            );
            const minutes = elapsedMinutes % 60;

            return hours + "h " + minutes + "m";
        }

        function setTextIfChanged(node, value) {
            if (
                node &&
                node.textContent !== value
            ) {
                node.textContent = value;
            }
        }

        function updateSessionDisplay() {
            const elapsed = elapsedLabel();

            setTextIfChanged(
                timeSlot,
                elapsed
            );
            setTextIfChanged(
                pagesSlot,
                String(session.pagesVisited)
            );
            setTextIfChanged(
                threadsSlot,
                String(session.threads.length)
            );
            setTextIfChanged(
                sinceSlot,
                sessionTimeFormatter.format(
                    new Date(session.startedAt)
                )
            );
            setTextIfChanged(
                summary,
                elapsed +
                    " · " +
                    session.pagesVisited +
                    (session.pagesVisited === 1
                        ? " page"
                        : " pages")
            );
        }

        updateSessionDisplay();

        const sessionToggle = widget.querySelector(
            '[data-heat-os-toggle="session"]'
        );

        if (sessionToggle) {
            sessionToggle.addEventListener(
                "click",
                updateSessionDisplay
            );
        }

        widget
            .querySelectorAll("[data-heat-os-bulk]")
            .forEach(function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        if (
                            button.getAttribute(
                                "data-heat-os-bulk"
                            ) !== "collapse"
                        ) {
                            updateSessionDisplay();
                        }
                    }
                );
            });

        document.addEventListener(
            "visibilitychange",
            function () {
                if (
                    document.visibilityState ===
                        "visible" &&
                    sessionCard &&
                    !sessionCard.classList.contains(
                        "is-collapsed"
                    )
                ) {
                    updateSessionDisplay();
                }
            }
        );
    }


    initializeReadingProgress();
    initializeScratchpad();
    initializeThreadInfo();
    initializeDisplayControls();
    initializeSession();

})();
}
