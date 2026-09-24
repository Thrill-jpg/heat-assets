/* =====================================================================
   HEAT HEAD RUNTIME
   Regenerated from September 4, 2026 HEAT MiamiOS v12 live backup.
   Source: Miami WEBPAGE CSS.html
   Hosted development build: 1.1.1-dev.26
   ===================================================================== */

/* =========================================================
   HEAT WALLPAPER PLACEHOLDER PRE-PAINT GUARD

   Template examples use WALLPAPER_URL as an editing prompt. When that
   prompt is left untouched, remove only the invalid custom property before
   the template can resolve it as a network request. Real wallpaper URLs are
   left alone.
   ========================================================= */
(function installHeatWallpaperPlaceholderGuard() {
    "use strict";

    const placeholderPattern = /WALLPAPER_URL/i;
    const placeholderSelector =
        '.heat-dev[style*="WALLPAPER_URL" i]';

    function sanitizeElement(element) {
        if (!element || element.nodeType !== 1) {
            return;
        }

        const wallpaperValue =
            element.style.getPropertyValue(
                "--hd-wallpaper"
            );

        if (!placeholderPattern.test(wallpaperValue)) {
            return;
        }

        element.style.removeProperty(
            "--hd-wallpaper"
        );
        element.classList.remove(
            "heat-dev--wallpaper"
        );
        element.setAttribute(
            "data-heat-wallpaper-placeholder",
            ""
        );
    }

    function sanitizeTree(root) {
        if (!root) return;

        if (
            root.nodeType === 1 &&
            root.matches(placeholderSelector)
        ) {
            sanitizeElement(root);
        }

        if (
            typeof root.querySelectorAll ===
            "function"
        ) {
            root
                .querySelectorAll(
                    placeholderSelector
                )
                .forEach(sanitizeElement);
        }
    }

    const observer = new MutationObserver(
        function (records) {
            records.forEach(function (record) {
                if (record.type === "attributes") {
                    sanitizeElement(record.target);
                    return;
                }

                record.addedNodes.forEach(
                    sanitizeTree
                );
            });
        }
    );

    observer.observe(
        document.documentElement,
        {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["style"]
        }
    );

    function finish() {
        sanitizeTree(document);
        observer.disconnect();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            finish,
            { once: true }
        );
    } else {
        finish();
    }
})();

/* =========================================================
   HEAT FOUNDATION — PHASE 9A
   NATIVE-PRESERVING LOGIN BEHAVIOR

   Jcink owns the actual form, controls, validation and submit.
   HEAT JS now handles interaction/data only.
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const isDedicatedLogin =
        (params.get('act') || '').toLowerCase() === 'login';
    const loginForm = document.querySelector('form[name="LOGIN"]');

    if (loginForm && !isDedicatedLogin) {
        const loginURL = new URL(
            'index.php?act=Login&CODE=00',
            window.location.href
        );
        loginURL.searchParams.set('referer', window.location.href);
        window.location.replace(loginURL.href);
        return;
    }

    if (!isDedicatedLogin) return;

    if (!loginForm) {
        console.warn('HEAT login: native Jcink LOGIN form was not found.');
        window.HEAT_ACCOUNT_FAIL_OPEN?.('login');
        return;
    }

    const refererInput = loginForm.querySelector('input[name="referer"]');
    const requestedReferer = params.get('referer');
    if (requestedReferer && refererInput) {
        try {
            const returnURL = new URL(requestedReferer, window.location.origin);
            if (returnURL.origin === window.location.origin) {
                refererInput.value =
                    returnURL.pathname + returnURL.search + returnURL.hash;
            }
        } catch (error) {}
    }

    const screen = document.querySelector('[data-heat-login-native-screen]');
    const optionsButton = document.querySelector('[data-heat-login-options-toggle]');

    if (optionsButton) {
        optionsButton.addEventListener('click', function () {
            const willOpen =
                optionsButton.getAttribute('aria-expanded') !== 'true';
            optionsButton.setAttribute('aria-expanded', String(willOpen));
            document.body.classList.toggle('heat-login-options-open', willOpen);
            loginForm.classList.toggle('heat-login-options-open', willOpen);
            screen?.classList.toggle('heat-login-options-open', willOpen);
        });
    }

    window.HEAT_ACCOUNT_CLOCK?.(
        document.querySelector('[data-heat-login-date]'),
        document.querySelector('[data-heat-login-time]')
    );

    document.querySelectorAll(
        '[data-heat-login-native-screen] .heat-login-system-actions button'
    ).forEach(function (button) {
        button.addEventListener('click', function () {
            const label = button.querySelector('small');
            if (!label) return;
            const originalText = label.textContent;
            button.classList.add('heat-login-action-active');
            label.textContent = 'Unavailable';
            window.setTimeout(function () {
                button.classList.remove('heat-login-action-active');
                label.textContent = originalText;
            }, 1200);
        });
    });
});

/* =========================================================
   HEAT FOUNDATION — PHASE 9B NATIVE REGISTRATION CONTRACT

   Registration keeps Jcink's real forms, controls, warnings and
   Turnstile exactly where Jcink rendered them. JavaScript is limited
   to the one Step 01 submit bridge, agreement feedback, the clock,
   and a one-shot prepaint marker for the POST-only Step 02 route.
   ========================================================= */
(function () {
    "use strict";

    if (!window.HEAT_ACCOUNT_ROUTE?.isRegistration) {
        return;
    }

    function start() {
        const params = new URLSearchParams(window.location.search);
        const action = (params.get("act") || "").toLowerCase();
        const code = String(
            params.get("CODE") ||
            params.get("code") ||
            ""
        ).toUpperCase();

        const step2Form = document.querySelector(
            'form[name="REG"] input[name="CODE"][value="02"]'
        )?.form || null;

        const isStep2 = Boolean(step2Form);
        const isStep1 = Boolean(
            action === "reg" &&
            (code === "00" || code === "01")
        );

        if (!isStep1 && !isStep2) {
            if (window.HEAT_ACCOUNT_ROUTE?.isRegistration) {
                window.HEAT_ACCOUNT_FAIL_OPEN?.('registration');
            }
            return;
        }

        document.documentElement.classList.add(
            "heat-registration-native"
        );

        document.documentElement.classList.toggle(
            "heat-registration-step-1",
            isStep1
        );

        document.documentElement.classList.toggle(
            "heat-registration-step-2",
            isStep2
        );

        document.body.classList.add("heat-register-page");
        document.body.classList.toggle(
            "heat-register-rules-page",
            isStep1
        );
        document.body.classList.toggle(
            "heat-register-account-page",
            isStep2
        );

        window.HEAT_ACCOUNT_CLOCK?.(
            document.querySelector('[data-heat-register-date]'),
            document.querySelector('[data-heat-register-time]')
        );

        if (isStep1) {
            const title = Array.from(
                document.querySelectorAll(
                    '#innerwrapper .tableborder .maintitle'
                )
            ).find(function (node) {
                return /registration\s+(terms|rules)/i.test(
                    node.textContent || ""
                );
            });

            const block = title?.closest('.tableborder') || null;
            const agreement = block?.querySelector(
                'input[name="read_tos"][type="checkbox"]'
            ) || null;
            const form = agreement?.form || null;
            const submit = block?.querySelector(
                '.row2[align="center"] input[type="submit"], ' +
                '.row2[align="center"] button[type="submit"]'
            ) || null;

            if (!block || !agreement || !form || !submit) {
                console.warn(
                    'HEAT registration: native Step 01 contract was not found.'
                );
                window.HEAT_ACCOUNT_FAIL_OPEN?.('registration');
                return;
            }

            submit.addEventListener('click', function (event) {
                event.preventDefault();

                if (!agreement.checked) {
                    block.classList.add(
                        'heat-register-agreement-error'
                    );

                    window.setTimeout(function () {
                        block.classList.remove(
                            'heat-register-agreement-error'
                        );
                    }, 1400);

                    return;
                }

                try {
                    window.sessionStorage.setItem(
                        'heatRegistrationStep2Pending',
                        '1'
                    );
                } catch (error) {
                    /* CSS :has() still provides a no-storage fallback. */
                }

                if (typeof form.requestSubmit === 'function') {
                    form.requestSubmit();
                } else {
                    form.submit();
                }
            });
        }

        if (isStep2) {
            const agreement = step2Form.querySelector(
                'input[name="agree"]'
            );
            const submit = step2Form.querySelector(
                'input[type="submit"], button[type="submit"]'
            );

            if (agreement && submit) {
                submit.addEventListener('click', function () {
                    if (agreement.checked) return;

                    step2Form.classList.add(
                        'heat-register-agreement-error'
                    );

                    window.setTimeout(function () {
                        step2Form.classList.remove(
                            'heat-register-agreement-error'
                        );
                    }, 1400);
                });
            }
        }

        window.HEAT_ACCOUNT_READY?.(
            'registration',
            document.querySelector(
                '[data-heat-register-native-chrome]'
            )
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();

/* =========================================================
   HEAT NATIVE QUICK EDIT FINISH FIX

   Replaces Jcink's outdated post-extraction regex with a
   direct marker lookup that works reliably on large skins.
   ========================================================= */

(function installHeatQuickEditFinishFix(attempt) {

    const pageRoute =
        window.HEAT_PAGE_ROUTE || {};

    /*
     * Cleanup Pass 2: Quick Edit exists only in topic output. The old
     * installer retried every 100ms forever on Board Index, forum,
     * posting, profile, UserCP and message routes where SKIFS.quickEdit
     * could never become relevant.
     */
    if (!pageRoute.isTopic) {
        return;
    }

    const retryCount = Number(attempt) || 0;
    const maxRetries = 50;

    if (
        !window.SKIFS ||
        !window.SKIFS.quickEdit
    ) {
        if (retryCount < maxRetries) {
            window.setTimeout(
                function () {
                    installHeatQuickEditFinishFix(
                        retryCount + 1
                    );
                },
                100
            );
        }

        return;
    }

    const quickEdit =
        window.SKIFS.quickEdit;

    if (quickEdit.__heatFinishFixInstalled) {
        return;
    }

    quickEdit.__heatFinishFixInstalled = true;


    quickEdit.finish = function (pid, response) {

        const formElement =
            document.getElementById(
                "qe-form-" + pid
            );

        const postElement =
            document.getElementById(
                "pid_" + pid
            );

        const startMarker =
            "<!-- THE POST " + pid + " -->";

        const endMarker =
            "<!-- THE POST -->";

        const startPosition =
            response.indexOf(startMarker);

        const contentStart =
            startPosition === -1
                ? -1
                : startPosition +
                  startMarker.length;

        const endPosition =
            contentStart === -1
                ? -1
                : response.indexOf(
                    endMarker,
                    contentStart
                );


        if (
            !postElement ||
            startPosition === -1 ||
            endPosition === -1
        ) {
            window.alert(
                "An error has occurred while saving your post."
            );

            if (
                formElement &&
                formElement.save
            ) {
                formElement.save.disabled =
                    false;

                formElement.save.value =
                    "Save Changes";
            }

            if (
                formElement &&
                formElement.Post
            ) {
                formElement.Post.disabled =
                    false;
            }

            if (
                formElement &&
                formElement.cancel
            ) {
                formElement.cancel.disabled =
                    false;
            }

            return;
        }


        const updatedPost =
            response.slice(
                contentStart,
                endPosition
            );


        postElement.innerHTML =
            updatedPost;


        if (
            typeof window.imageResizerInit ===
            "function"
        ) {
            window.imageResizerInit();
        }


        document.dispatchEvent(
            new CustomEvent(
                "heat:quick-edit-updated",
                {
                    detail: {
                        postElement: postElement,
                        postId: pid
                    }
                }
            )
        );


        this.originalPostHtml[pid] =
            null;

        this.postIcons[pid] =
            null;
    };

})(0);

(function () {
    "use strict";

    const pageRoute =
        window.HEAT_PAGE_ROUTE || {};

    /*
     * Cleanup Pass 2: member CODE blocks and Quick Edit updates belong
     * to topic output. Other routes skip the ready handler and custom
     * event listener entirely.
     */
    if (!pageRoute.isTopic) {
        return;
    }

    const CODE_SELECTOR =
        '.heat-post-copy [id="CODE"]';

    function codeText(codeBlock) {
        const clone = codeBlock.cloneNode(true);

        clone
            .querySelectorAll('.heat-code-copy-button')
            .forEach(function (button) {
                button.remove();
            });

        /*
         * Jcink renders saved CODE line breaks as real BR elements.
         * textContent does not include a newline for BR, so the old
         * copy routine silently flattened carefully formatted member
         * code when it was copied.
         *
         * Restore those BR nodes to literal newline text INSIDE THE
         * CLONE before reading textContent. This preserves the exact
         * source layout members arranged in the CODE block without
         * touching the visible post.
         */
        clone
            .querySelectorAll("br")
            .forEach(function (lineBreak) {
                lineBreak.replaceWith(
                    document.createTextNode("\n")
                );
            });

        return String(
            clone.textContent ||
            ""
        )
            .replace(/\r\n?/g, "\n")
            .replace(/\u00a0/g, " ");
    }

    function fallbackCopy(text) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";
        textarea.style.left = "-9999px";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);

        let succeeded = false;

        try {
            succeeded = document.execCommand("copy");
        } catch (error) {
            succeeded = false;
        }

        textarea.remove();
        return succeeded;
    }

    async function copyCode(codeBlock) {
        const text = codeText(codeBlock);
        let copied = false;

        try {
            if (
                navigator.clipboard &&
                typeof navigator.clipboard.writeText === "function"
            ) {
                await navigator.clipboard.writeText(text);
                copied = true;
            } else {
                copied = fallbackCopy(text);
            }
        } catch (error) {
            copied = fallbackCopy(text);
        }

        codeBlock.setAttribute(
            "data-heat-code-copy-state",
            copied ? "copied" : "failed"
        );

        window.setTimeout(function () {
            codeBlock.removeAttribute(
                "data-heat-code-copy-state"
            );
        }, 1800);
    }

    function addCopyControl(codeBlock) {
        if (
            !codeBlock ||
            codeBlock.nodeType !== 1 ||
            codeBlock.querySelector(
                ':scope > .heat-code-copy-button'
            )
        ) {
            return;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "heat-code-copy-button";
        button.textContent = "Copy Code";
        button.setAttribute(
            "aria-label",
            "Copy code to clipboard"
        );

        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            copyCode(codeBlock);
        });

        codeBlock.appendChild(button);
    }

    function addControlsWithin(root) {
        if (!root) {
            return;
        }

        if (
            root.nodeType === 1 &&
            root.matches &&
            root.matches(CODE_SELECTOR)
        ) {
            addCopyControl(root);
        }

        if (root.querySelectorAll) {
            root
                .querySelectorAll('[id="CODE"]')
                .forEach(function (codeBlock) {
                    if (codeBlock.closest('.heat-post-copy')) {
                        addCopyControl(codeBlock);
                    }
                });
        }
    }

    function initialize() {
        addControlsWithin(document);
    }

    /* MIAMI is emitted in <head>, so this one-time pass waits only to add
       the invisible interactive button. All geometry is already CSS-owned. */
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }

    /* Quick Edit is an explicit user interaction, not first paint. The native
       Quick Edit finish hook dispatches this event only for the post it replaced. */
    document.addEventListener(
        "heat:quick-edit-updated",
        function (event) {
            addControlsWithin(
                event.detail &&
                event.detail.postElement
                    ? event.detail.postElement
                    : null
            );
        }
    );
})();
