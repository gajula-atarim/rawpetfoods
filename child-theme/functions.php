<?php
/**
 * Hello Elementor Child – theme functions.
 */

add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'hello-elementor-parent-style', get_template_directory_uri() . '/style.css' );
	wp_enqueue_style(
		'hello-elementor-child-style',
		get_stylesheet_uri(),
		array( 'hello-elementor-parent-style' ),
		wp_get_theme()->get( 'Version' )
	);
	wp_enqueue_style(
		'rpf-custom',
		get_stylesheet_directory_uri() . '/rpf-custom.css',
		array( 'hello-elementor-child-style' ),
		filemtime( get_stylesheet_directory() . '/rpf-custom.css' )
	);
	wp_enqueue_script(
		'rpf-custom',
		get_stylesheet_directory_uri() . '/rpf-custom.js',
		array(),
		filemtime( get_stylesheet_directory() . '/rpf-custom.js' ),
		true
	);
}, 20 );
