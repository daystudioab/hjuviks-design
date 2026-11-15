<?php
/**
 * Plugin Name: Hjuviks Marina – Design och rörelse
 * Description: Rörelser för hero, rubriker, citat och bilder (GSAP) samt ankarlänkar för one-page. Respekterar "minska rörelse" i besökarens inställningar.
 * Version: 1.24.0
 * Update URI: https://github.com/daystudioab/hjuviks-design
 * Author: Studio Day
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Uppdateringar från GitHub (daystudioab/hjuviks-design).
 * Nya versioner publiceras som GitHub-releaser och visas under Tillägg som vanliga uppdateringar.
 * Privat repo: lägg in en läsnyckel i wp-config.php:
 *   define( 'STUDIODAY_GITHUB_TOKEN', 'github_pat_…' );
 */
require_once __DIR__ . '/lib/plugin-update-checker/plugin-update-checker.php';

$hjd_uppdaterare = \YahnisElsts\PluginUpdateChecker\v5\PucFactory::buildUpdateChecker(
	'https://github.com/daystudioab/hjuviks-design/',
	__FILE__,
	'hjuviks-design'
);
$hjd_uppdaterare->getVcsApi()->enableReleaseAssets( '/hjuviks-design\\.zip$/' );
if ( defined( 'STUDIODAY_GITHUB_TOKEN' ) && STUDIODAY_GITHUB_TOKEN ) {
	$hjd_uppdaterare->setAuthentication( STUDIODAY_GITHUB_TOKEN );
}

define( 'HJD_VERSION', '1.24.0' );
define( 'HJD_URL', plugin_dir_url( __FILE__ ) );

/**
 * Kör inte i Elementor-redigeraren eller dess förhandsvisning.
 */
function hjd_is_frontend() {
	if ( is_admin() || wp_doing_ajax() ) {
		return false;
	}
	// phpcs:ignore WordPress.Security.NonceVerification
	if ( isset( $_GET['elementor-preview'] ) ) {
		return false;
	}
	return true;
}

/**
 * Markera att JS finns, tidigt i <head>, så att rubriken kan döljas före introt.
 */
add_action( 'wp_head', function () {
	if ( ! hjd_is_frontend() ) {
		return;
	}
	echo "<script>document.documentElement.classList.add('hjd-js');</script>\n";
}, 1 );

add_action( 'wp_enqueue_scripts', function () {
	if ( ! hjd_is_frontend() ) {
		return;
	}

	wp_enqueue_style( 'hjd-design', HJD_URL . 'assets/design.css', array(), HJD_VERSION );

	wp_enqueue_script( 'hjd-ankare', HJD_URL . 'assets/ankare.js', array(), HJD_VERSION, true );
	wp_enqueue_script( 'hjd-dragspel', HJD_URL . 'assets/dragspel.js', array(), HJD_VERSION, true );
	wp_enqueue_script( 'hjd-gsap', HJD_URL . 'assets/vendor/gsap.min.js', array(), '3.15.0', true );
	wp_enqueue_script( 'hjd-scrolltrigger', HJD_URL . 'assets/vendor/ScrollTrigger.min.js', array( 'hjd-gsap' ), '3.15.0', true );
	wp_enqueue_script( 'hjd-splittext', HJD_URL . 'assets/vendor/SplitText.min.js', array( 'hjd-gsap' ), '3.15.0', true );
	wp_enqueue_script( 'hjd-rorelse', HJD_URL . 'assets/rorelse.js', array( 'hjd-gsap', 'hjd-scrolltrigger', 'hjd-splittext' ), HJD_VERSION, true );
} );
