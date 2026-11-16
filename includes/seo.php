<?php
/**
 * Hjuviks Marina – sökmotor- och delningsdata för startsidan.
 *
 * Titel, metabeskrivning, Open Graph (bild och text när sidan delas), strukturerad data för
 * hamnen (LocalBusiness och WebSite) och förladdning av herobilden. Alla adresser byggs med
 * home_url(), så de följer med när sajten flyttas från utvecklingsdomänen.
 * Dessutom stängs RSS-flöden och emoji-skriptet av: sajten har inga inlägg.
 *
 * Texterna kan ändras med filtren hjd_seo_titel och hjd_seo_beskrivning, herobilden med
 * hjd_seo_herobild (adress till bilden, eller tom sträng för att stänga av förladdningen).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function hjd_seo_titel() {
	return apply_filters( 'hjd_seo_titel', 'Hjuviks Marina | Båtplatser i Hjuvik, Torslanda' );
}

function hjd_seo_beskrivning() {
	return apply_filters( 'hjd_seo_beskrivning', 'Småbåtshamn i Hjuvik på Hisingen, en kvart från Älvsborgsbron. Båtplatser med nyttjanderätt, sjöbodar och parkering. Se priser och vanliga frågor.' );
}

add_filter( 'pre_get_document_title', function ( $titel ) {
	return is_front_page() ? hjd_seo_titel() : $titel;
}, 20 );

add_action( 'wp_head', function () {
	if ( ! is_front_page() ) {
		return;
	}
	$url   = home_url( '/' );
	$bild  = HJD_URL . 'assets/delningsbild.jpg';
	$titel = hjd_seo_titel();
	$besk  = hjd_seo_beskrivning();

	// Herobilden är sidans största element. Förladdningen gör att den hämtas direkt.
	$hero = apply_filters( 'hjd_seo_herobild', content_url( '/uploads/2026/11/hjuvik-hero-skymning-kvinna-scaled.webp' ) );
	if ( $hero ) {
		printf( '<link rel="preload" as="image" href="%s" fetchpriority="high" />' . "\n", esc_url( $hero ) );
	}

	printf( '<meta name="description" content="%s" />' . "\n", esc_attr( $besk ) );
	$og = array(
		'og:type'        => 'website',
		'og:locale'      => 'sv_SE',
		'og:site_name'   => 'Hjuviks Marina',
		'og:title'       => $titel,
		'og:description' => $besk,
		'og:url'         => $url,
		'og:image'       => $bild,
		'og:image:width' => '1200',
		'og:image:height' => '630',
		'og:image:alt'   => 'Bryggorna i Hjuviks Marina en solig sommardag',
	);
	foreach ( $og as $egenskap => $varde ) {
		printf( '<meta property="%s" content="%s" />' . "\n", esc_attr( $egenskap ), esc_attr( $varde ) );
	}
	echo '<meta name="twitter:card" content="summary_large_image" />' . "\n";

	$data = array(
		'@context' => 'https://schema.org',
		'@graph'   => array(
			array(
				'@type'    => 'WebSite',
				'@id'      => $url . '#webbplats',
				'url'      => $url,
				'name'     => 'Hjuviks Marina',
				'inLanguage' => 'sv-SE',
			),
			array(
				'@type'          => 'LocalBusiness',
				'@id'            => $url . '#hamn',
				'name'           => 'Hjuviks Marina',
				'legalName'      => 'Hjuviks Marina Förvaltning AB',
				'description'    => $besk,
				'url'            => $url,
				'image'          => $bild,
				'email'          => 'info@hjuviksmarina.se',
				'telephone'      => '+46705631313',
				'address'        => array(
					'@type'           => 'PostalAddress',
					'streetAddress'   => 'Hamnfyrsvägen 3',
					'postalCode'      => '423 40',
					'addressLocality' => 'Torslanda',
					'addressRegion'   => 'Västra Götalands län',
					'addressCountry'  => 'SE',
				),
				'areaServed'     => 'Göteborg',
			),
		),
	);
	echo '<script type="application/ld+json">' . wp_json_encode( $data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . '</script>' . "\n";
}, 2 );

// Inga inlägg: ta bort flödeslänkarna ur <head> och led flödesadresserna till startsidan.
add_action( 'init', function () {
	remove_action( 'wp_head', 'feed_links', 2 );
	remove_action( 'wp_head', 'feed_links_extra', 3 );
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );
} );

foreach ( array( 'do_feed', 'do_feed_rdf', 'do_feed_rss', 'do_feed_rss2', 'do_feed_atom', 'do_feed_rss2_comments', 'do_feed_atom_comments' ) as $hjd_flode ) {
	add_action( $hjd_flode, function () {
		wp_safe_redirect( home_url( '/' ), 301 );
		exit;
	}, 1 );
}
