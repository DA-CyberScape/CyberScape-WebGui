<script>
	import { onMount } from 'svelte';
	import jQuery from 'jquery';

	onMount(() => {
		// Handle link click to update the current page item
		jQuery('.sidenav a').click(function() {
			jQuery('.sidenav a').removeClass('current_page_item');
			jQuery(this).addClass('current_page_item');
		});

		// Hover handling for sidebar and main content area
		jQuery('.nav-container').hover(
			function() {
				jQuery('#sidenav').addClass('open');
				jQuery('.main').addClass('open');
				jQuery('.nav-link .material-icons').addClass('open');
			},
			function() {
				jQuery('#sidenav').removeClass('open');
				jQuery('.main').removeClass('open');
				jQuery('.nav-link .material-icons').removeClass('open');
			}
		);

		// Set current page item on page load
		const currentPath = window.location.pathname;
		jQuery('.sidenav a').each(function() {
			if (jQuery(this).attr('href') === currentPath) {
				jQuery(this).addClass('current_page_item');
			}
		});
	});
</script>


<div class="nav-container">
	<nav id="sidenav" class="sidenav">
		<a href="/" class="nav-link">Home<i class="material-icons">home</i></a>
		<a href="/Data_Base" class="nav-link">Data Base<i class="material-icons">settings</i></a>
		<a href="/Data_Sources" class="nav-link">Data Sources<i class="material-icons">list</i></a>
		<a href="/Account" class="nav-link">Account<i class="material-icons">account_circle</i></a>
	</nav>
</div>