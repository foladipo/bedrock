/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function (Mozilla, Waypoint) {
    'use strict';

    // Basic feature detect for JS support.
    function supportsBaselineJS() {
        return 'querySelector' in document &&
               'querySelectorAll' in document &&
               'addEventListener' in window &&
               typeof HTMLMediaElement !== 'undefined';
    }

    function trackVideoInteraction(title, state) {
        window.dataLayer.push({
            'event': 'video-interaction',
            'videoTitle': title,
            'interaction': state
        });
    }

    function initVideoInteractionTracking(video) {
        if (video instanceof HTMLVideoElement) {
            video.addEventListener('play', function() {
                trackVideoInteraction(this.getAttribute('data-ga-label'), 'play');
            }, false);

            video.addEventListener('pause', function() {
                var action = this.currentTime === this.duration ? 'complete' : 'pause';
                trackVideoInteraction(this.getAttribute('data-ga-label'), action);
            }, false);
        }
    }

    function initVideoThumbnails() {
        var videoButtons = document.querySelectorAll('.moz-video-button');

        for (var i = 0; i < videoButtons.length; i++) {
            videoButtons[i].addEventListener('click', lazyLoadVideo, false);
            videoButtons[i].style.display = 'block';
        }
    }

    function lazyLoadVideo(e) {
        var targetSrc = e.target.getAttribute('data-src');
        var targetPoster = e.target.getAttribute('data-poster');
        var targetMuted = e.target.getAttribute('data-muted');
        var targetInline = e.target.getAttribute('data-inline');
        var targetGALabel = e.target.getAttribute('data-ga-label');
        var targetContainerId = e.target.getAttribute('data-container-id');
        var videoContainer = document.getElementById(targetContainerId);
        var videoFragment = document.createDocumentFragment();
        var videoElement = document.createElement('video');
        var sourceWebm = document.createElement('source');
        var sourceOgv = document.createElement('source');
        var sourceMp4 = document.createElement('source');

        sourceWebm.setAttribute('src', targetSrc + '.webm');
        sourceWebm.setAttribute('type', 'video/webm');

        sourceOgv.setAttribute('src', targetSrc + '.ogv');
        sourceOgv.setAttribute('type', 'video/ogg; codecs=\'theora, vorbis\'');

        sourceMp4.setAttribute('src', targetSrc + '.mp4');
        sourceMp4.setAttribute('type', 'video/mp4');

        videoFragment.appendChild(videoElement);
        videoElement.appendChild(sourceWebm);
        videoElement.appendChild(sourceOgv);
        videoElement.appendChild(sourceMp4);

        videoElement.controls = 'controls';
        videoElement.poster = targetPoster;

        videoElement.setAttribute('data-ga-label', targetGALabel);

        if (targetMuted) {
            videoElement.muted = true;
        }

        if (targetInline) {
            videoElement.playsinline = true;
        }

        videoContainer.innerHTML = '';
        videoContainer.appendChild(videoFragment);

        initVideoInteractionTracking(videoElement);

        videoElement.load();

        e.target.style.display = 'none';

        try {
            videoElement.play();
        } catch (err) {
            // do nothing
        }
    }

    // Bind one time scroll tracking events for main page sections.
    function initScrollTracking() {
        var sections = document.querySelectorAll('[data-scroll-tracking]');

        for (var i = 0; i < sections.length; i++) {
            new Waypoint({
                element: sections[i],
                handler: function(direction) {
                    if (direction === 'down') {
                        window.dataLayer.push({
                            'eAction': 'scroll',
                            'eLabel': this.element.getAttribute('data-scroll-tracking'),
                            'event': 'non-interaction'
                        });
                        this.destroy(); // only fire tracking events once
                    }
                },
                offset: '100%'
            });
        }
    }

    if (supportsBaselineJS()) {
        initVideoThumbnails();
        initScrollTracking();
        initVideoInteractionTracking();
    }

})(window.Mozilla, window.Waypoint);
