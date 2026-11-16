<?php
/**
 * Hjuviks Marina – sparade versioner (revisioner).
 *
 * 1. Tak för hur många versioner WordPress sparar per sida (15), så att startsidan inte växer
 *    till hundratals versioner. När WordPress sparar en sida läser det in alla dess versioner,
 *    och med flera hundra versioner tog minnet slut (HTTP 500 i Elementor). Taket gäller bara
 *    när wp-config.php inte redan anger ett tal i WP_POST_REVISIONS, och kan ändras med
 *    define( 'HJD_VERSIONER', 20 );
 *
 * 2. Rensning för administratörer: POST /wp-json/hjd/v1/rensa-versioner med post (sidans id),
 *    behall (antal nyaste versioner som sparas, standard 10) och max (antal som tas bort per
 *    anrop, standard 100). Svarar med hur många som togs bort och hur många som återstår.
 *    WordPress eget REST-gränssnitt tillåter inte att versioner raderas, därför finns den här.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'wp_revisions_to_keep', function ( $antal ) {
	// Ett tal i wp-config.php (0 eller mer) gäller före taket här.
	if ( $antal >= 0 ) {
		return $antal;
	}
	return defined( 'HJD_VERSIONER' ) ? (int) HJD_VERSIONER : 15;
}, 20 );

add_action( 'rest_api_init', function () {
	register_rest_route( 'hjd/v1', '/rensa-versioner', array(
		'methods'             => 'POST',
		'permission_callback' => function () {
			return current_user_can( 'manage_options' );
		},
		'args'                => array(
			'post'   => array( 'type' => 'integer', 'required' => true ),
			'behall' => array( 'type' => 'integer', 'default' => 10 ),
			'max'    => array( 'type' => 'integer', 'default' => 100 ),
		),
		'callback'            => function ( WP_REST_Request $req ) {
			$post   = (int) $req['post'];
			$behall = max( 1, (int) $req['behall'] );
			$max    = min( 200, max( 1, (int) $req['max'] ) );

			if ( ! get_post( $post ) ) {
				return new WP_Error( 'hjd_ingen_sida', 'Sidan finns inte.', array( 'status' => 404 ) );
			}

			// Bara id:n, så att inga versioner med innehåll läses in i minnet.
			$ids = get_posts( array(
				'post_type'        => 'revision',
				'post_status'      => 'any',
				'post_parent'      => $post,
				'fields'           => 'ids',
				'posts_per_page'   => -1,
				'orderby'          => array( 'date' => 'DESC', 'ID' => 'DESC' ),
				'no_found_rows'    => true,
				'suppress_filters' => true,
			) );

			$att_ta_bort = array_slice( $ids, $behall, $max );
			$borttagna   = 0;
			foreach ( $att_ta_bort as $id ) {
				if ( wp_delete_post_revision( $id ) ) {
					$borttagna++;
				}
			}

			return array(
				'post'      => $post,
				'totalt'    => count( $ids ),
				'borttagna' => $borttagna,
				'aterstar'  => max( 0, count( $ids ) - $behall - $borttagna ),
				'sparade'   => array_slice( $ids, 0, $behall ),
			);
		},
	) );
} );
