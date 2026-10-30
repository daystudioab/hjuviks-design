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
 * Färdiga färgskalor att utgå från, grupperade efter tid på dygnet.
 * Ordning i varje skala: djup, spridning, zenit, horisont, sol.
 */
function hjd_hav_forval_grupper() {
	return array(
		'Dag' => array(
			'Klarblå sommar' => array( '#002A5E', '#0A8BD8', '#1466D2', '#7FC2F0', '#FFF4DC' ),
			'Turkos lagun' => array( '#00404A', '#0FB5B0', '#1C8FC9', '#9FE3E6', '#FFF6E0' ),
		),
		'Morgon' => array(
			'Morgongry' => array( '#1C2440', '#6E7FB8', '#8C8FC4', '#F4B9B2', '#FFE3D1' ),
			'Soluppgång' => array( '#1B2540', '#5B86B4', '#7A8EC4', '#FFB98A', '#FFD49A' ),
			'Morgondis' => array( '#2A3B4D', '#7FA3B8', '#A4B9CC', '#E6E1DA', '#FFF7EC' ),
			'Blank morgon' => array( '#0D3557', '#3E9AD0', '#6FAEE0', '#D7EAF5', '#FFFBEF' ),
			'Vårmorgon' => array( '#0F2F38', '#3F8E93', '#5B8FA8', '#C9E2DC', '#F5FBF2' ),
			'Persikogryning' => array( '#2B2440', '#B07C8A', '#8F86BE', '#FFC7A1', '#FFE2C4' ),
		),
		'Kväll' => array(
			'Gyllene timmen' => array( '#1F2236', '#8A6A5A', '#5A6A9E', '#F6B565', '#FFD27A' ),
			'Solnedgång' => array( '#1E1530', '#6A3F78', '#5A3E86', '#F07F5A', '#FFB36B' ),
			'Kvällssol' => array( '#0E1F45', '#2F6FB5', '#3A4F9A', '#F2B48A', '#FFD9A8' ),
			'Skymning' => array( '#14122E', '#4B3F8C', '#3A2F73', '#B48BC8', '#F2D4F0' ),
			'Midsommarnatt' => array( '#18243F', '#4D6EA6', '#4A5A92', '#E8B9C4', '#FFF0E6' ),
			'Månsken' => array( '#050B1C', '#1B3358', '#142446', '#4C6A92', '#E8EEF8' ),
		),
		'Blå timmen' => array(
			'Blå timmen' => array( '#071433', '#1F4F9A', '#1B2F6E', '#6E8BD0', '#DCE6FF' ),
			'Blå timmen djup' => array( '#040C24', '#173F84', '#12235A', '#5470B8', '#CFDBFF' ),
			'Blå timmen ljus' => array( '#0B1C45', '#2C66B8', '#2A4290', '#8EA8E3', '#E8EEFF' ),
			'Blå timmen rosa' => array( '#0A1638', '#2A5099', '#26336F', '#C99AB8', '#FFE4EC' ),
			'Blå timmen violett' => array( '#0C0F38', '#33459E', '#262A78', '#8478C8', '#E6DEFF' ),
			'Blå timmen guld' => array( '#071433', '#1F4F9A', '#1B2F6E', '#6E8BD0', '#FFCF85' ),
		),
	);
}

/**
 * Alla färdiga färgskalor i en platt lista (namn => färger).
 */
function hjd_hav_forval() {
	$ut = array();
	foreach ( hjd_hav_forval_grupper() as $skalor ) {
		$ut = array_merge( $ut, $skalor );
	}
	return $ut;
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
				<?php foreach ( hjd_hav_forval_grupper() as $grupp => $skalor ) : ?>
					<h3 class="hjd-hav-grupp"><?php echo esc_html( $grupp ); ?></h3>
					<div class="hjd-hav-forval">
						<?php foreach ( $skalor as $namn => $skala ) : ?>
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
				<?php endforeach; ?>

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
