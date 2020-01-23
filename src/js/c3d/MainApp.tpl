
<frag>
<div>
	<button class="bt1" x-click={this.showPuzzle('cube1')}>cube1</button>
	<button class="bt1" x-click={this.showPuzzle('knossos')}>knossos</button>
	<button class="bt1" x-click={this.showPuzzle('cubismerhan')}>cubismerhan</button>
</div>

<h1>{'pieces'}({state.puzzleName})</h1>
<div p="loop" as="base/Loop" item="c3d/PieceCanvas"/>
<h1>{'puzzles'}</h1>
<div p="loop2" as="base/Loop" item="c3d/PieceCanvas"/>


</frag>
