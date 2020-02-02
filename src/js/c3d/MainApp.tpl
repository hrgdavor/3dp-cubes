
<frag>
<div>
	<button class="bt1" x-click={this.showPuzzle('cube1')}>cube1</button>
	<button class="bt1" x-click={this.showPuzzle('knossos')}>knossos</button>
	<button class="bt1" x-click={this.showPuzzle('cubismerhan')}>cubismerhan</button>
	<button class="bt1" x-click={this.showPuzzle('coffinsq')}>Coffin's Quintet</button>
	<button class="bt1" x-click={this.showPuzzle('flat_out')}>Flat Out</button>
	<button class="bt1" x-click={this.showPuzzle('inchard')}>Incredibly hard</button>
</div>

<h1>{state.puzzleName} <span p='link'></span></h1>
<div p="credits"></div>
<h2>{'pieces'}</h2>
(dblclick: auto rotate)
<div p="loop" as="base/Loop" item="c3d/PieceCanvas"/>
<h2>{'puzzles'}</h2>
<div p="loop2" as="base/Loop" item="c3d/PieceCanvas"/>


</frag>
