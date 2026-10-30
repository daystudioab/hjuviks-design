<?php
/**
 * Utseende → Havsyta: välj färgerna i startsidans havsyta, med förhandsvisning.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'HJD_HAV_OPTION', 'hjd_hav_farger' );

/**
 * Färgerna som går att ställa in, med standardvärde, etikett och förklaring.
 */
function hjd_hav_falt() {
	return array(
		'djup'      => array( '#002A5E', 'Vattnets grundfärg', 'Den mörka tonen i vattnet. Styr också skuggan bakom texten.' ),
		'spridning' => array( '#0A8BD8', 'Ljus i vattnet', 'Färgen som lyser upp vågtopparna inifrån.' ),
		'zenit'     => array( '#1466D2', 'Himlen som speglas', 'Färgen på himlen högt upp, som speglas i vågsidorna.' ),
		'horisont'  => array( '#7FC2F0', 'Ljus himmel', 'Den ljusa himlen nära horisonten, syns i reflexerna längst bort.' ),
		'sol'       => array( '#FFF4DC', 'Solglitter', 'Färgen på solens glitter i vattnet.' ),
	);
}

/**
 * Färdiga färgskalor att utgå från.
 */
function hjd_hav_forval() {
	return array(
		'Klarblå sommar' => array( '#002A5E', '#0A8BD8', '#1466D2', '#7FC2F0', '#FFF4DC' ),
		'Turkos lagun'   => array( '#00404A', '#0FB5B0', '#1C8FC9', '#9FE3E6', '#FFF6E0' ),
		'Djupt hav'      => array( '#001833', '#0B5FA8', '#123E8C', '#5E93C9', '#E8F0FF' ),
		'Västkust grå'   => array( '#13242F', '#4A7A93', '#4E6E86', '#B9CAD4', '#F4F1EA' ),
		'Kvällssol'      => array( '#0E1F45', '#2F6FB5', '#3A4F9A', '#F2B48A', '#FFD9A8' ),
	);
}

/**
 * Sparade färger, med standard för det som saknas.
 */
function hjd_hav_farger() {
	$sparat = get_option( HJD_HAV_OPTION, array() );
	$ut     = array();
	foreach ( hjd_hav_falt() as $nyckel => $falt ) {
		$varde          = isset( $sparat[ $nyckel ] ) ? sanitize_hex_color( $sparat[ $nyckel ] ) : '';
		$ut[ $nyckel ] = $varde ? strtoupper( $varde ) : $falt[0];
	}
	return $ut;
}

/**
 * Sant om någon färg skiljer sig från standard.
 */
function hjd_hav_ar_andrat() {
	foreach ( hjd_hav_farger() as $nyckel => $varde ) {
		$falt = hjd_hav_falt();
		if ( strtoupper( $falt[ $nyckel ][0] ) !== $varde ) {
			return true;
		}
	}
	return false;
}

add_action( 'admin_init', function () {
	register_setting( 'hjd_hav', HJD_HAV_OPTION, array(
		'type'              => 'array',
		'sanitize_callback' => function ( $in ) {
			$ut = array();
			foreach ( hjd_hav_falt() as $nyckel => $falt ) {
				$varde          = isset( $in[ $nyckel ] ) ? sanitize_hex_color( wp_unslash( $in[ $nyckel ] ) ) : '';
				$ut[ $nyckel ] = $varde ? strtoupper( $varde ) : $falt[0];
			}
			return $ut;
		},
		'default'           => array(),
	) );
} );

add_action( 'admin_menu', function () {
	add_theme_page( 'Havsyta', 'Havsyta', 'edit_theme_options', 'hjd-havsyta', 'hjd_hav_sida' );
} );

add_action( 'admin_enqueue_scripts', function ( $hook ) {
	if ( 'appearance_page_hjd-havsyta' !== $hook ) {
		return;
	}
	wp_enqueue_style( 'wp-color-picker' );
	wp_enqueue_style( 'hjd-hav-admin', HJD_URL . 'assets/hav-admin.css', array( 'wp-color-picker' ), HJD_VERSION );
	wp_enqueue_script( 'hjd-hav-admin', HJD_URL . 'assets/hav-admin.js', array( 'jquery', 'wp-color-picker' ), HJD_VERSION, true );
	wp_add_inline_script(
		'wp-color-picker',
		'window.HJD_HAV_ADMIN = ' . wp_json_encode( array(
			'version'  => HJD_VERSION,
			'forval'   => hjd_hav_forval(),
			'standard' => array_map( function ( $f ) {
				return $f[0];
			}, hjd_hav_falt() ),
		) ) . ';'
	);
} );

/**
 * Inställningssidan.
 */
function hjd_hav_sida() {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		return;
	}
	$farger = hjd_hav_farger();
	?>
	<div class="wrap hjd-hav-wrap">
		<h1>Havsyta</h1>
		<p class="hjd-hav-ingress">Välj färgerna i havsytan på startsidan. Förhandsvisningen uppdateras direkt, och ändringen syns på sajten när du sparar.</p>

		<div class="hjd-hav-layout">
			<form method="post" action="options.php" class="hjd-hav-form">
				<?php settings_fields( 'hjd_hav' ); ?>

				<h2>Färdiga färgskalor</h2>
				<div class="hjd-hav-forval">
					<?php foreach ( hjd_hav_forval() as $namn => $skala ) : ?>
						<button type="button" class="hjd-hav-forval-knapp" data-forval="<?php echo esc_attr( $namn ); ?>">
							<span class="hjd-hav-prov">
								<?php foreach ( $skala as $hex ) : ?>
									<span style="background:<?php echo esc_attr( $hex ); ?>"></span>
								<?php endforeach; ?>
							</span>
							<?php echo esc_html( $namn ); ?>
						</button>
					<?php endforeach; ?>
				</div>

				<h2>Egna färger</h2>
				<table class="form-table" role="presentation">
					<?php foreach ( hjd_hav_falt() as $nyckel => $falt ) : ?>
						<tr>
							<th scope="row"><label for="hjd-hav-<?php echo esc_attr( $nyckel ); ?>"><?php echo esc_html( $falt[1] ); ?></label></th>
							<td>
								<input type="text" class="hjd-hav-farg" id="hjd-hav-<?php echo esc_attr( $nyckel ); ?>"
									name="<?php echo esc_attr( HJD_HAV_OPTION . '[' . $nyckel . ']' ); ?>"
									value="<?php echo esc_attr( $farger[ $nyckel ] ); ?>"
									data-nyckel="<?php echo esc_attr( $nyckel ); ?>"
									data-default-color="<?php echo esc_attr( $falt[0] ); ?>">
								<p class="description"><?php echo esc_html( $falt[2] ); ?></p>
							</td>
						</tr>
					<?php endforeach; ?>
				</table>

				<p class="submit">
					<?php submit_button( 'Spara färgerna', 'primary', 'submit', false ); ?>
					<button type="button" class="button hjd-hav-aterstall">Återställ till standard</button>
				</p>
			</form>

			<div class="hjd-hav-forhand">
				<div class="hjd-hav-scen" id="hjd-hav-scen">
					<div class="hjd-hav-scen-text">
						<h2>En liten hamn mitt i havsbandet</h2>
						<p>Förhandsvisning av havsytan</p>
					</div>
				</div>
				<p class="description">Utan WebGL visas en färgtoning i samma färger.</p>
			</div>
		</div>
	</div>
	<?php
}

/**
 * Reservtoning i heron (utan WebGL) när färgerna har ändrats från standard.
 */
add_action( 'wp_head', function () {
	if ( ! function_exists( 'hjd_is_frontend' ) || ! hjd_is_frontend() || ! is_front_page() || ! hjd_hav_ar_andrat() ) {
		return;
	}
	$f = hjd_hav_farger();
	printf(
		"<style id=\"hjd-hav-reserv\">.elementor header:has(h1){background-color:%1\$s !important;background-image:linear-gradient(180deg,%2\$s 0%%,%1\$s 100%%) !important;}</style>\n",
		esc_attr( $f['djup'] ),
		esc_attr( $f['spridning'] )
	);
}, 20 );
