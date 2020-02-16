<script>
	import Tailwindcss from './Tailwindcss.svelte';
	import { onMount } from 'svelte';
	const { electron } = window;
	import Video from './components/Video.svelte';
	export let files;
	let playFile;

	function onClick() {
		electron.send("toMain", {
			cmd: "DIR_READ",
			data: {

			}
		});
	}

	function playTheFile(file) {
		console.log(file);
		playFile = file;
	}

	electron.receive("fromMain", ({ cmd, data}) => {
		files = data.files[0];
	});
</script>

<Tailwindcss />
<main>
	<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" on:click={onClick}>
		Choose a media folder...
	</button>
	<Video src={playFile}/>
	<ul>
	{#if files}
		{#each files as file}
			<li on:click={ () => playTheFile(file) }>
				{file}
			</li>
		{/each}
	{/if}
</ul>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>