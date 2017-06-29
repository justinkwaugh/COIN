import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'

import PlaceWarbands from 'fallingsky/actions/placeWarbands'
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe'
import PlaceFort from 'fallingsky/actions/placeFort'
import PlaceLeader from 'fallingsky/actions/placeLeader'
import PlaceAuxilia from 'fallingsky/actions/placeAuxilia'
import PlaceLegions from 'fallingsky/actions/placeLegions'
import RevealPieces from 'fallingsky/actions/revealPieces'
import ArverniMarch from 'fallingsky/bots/arverni/arverniMarch';
import CommandModifier from 'fallingsky/commands/commandModifiers';

describe("Arverni march", function () {
    let state;
    let belgae;
    let arverni;
    let aedui;
    let romans;
    let germanic;

    beforeEach(function () {
        state = new FallingSkyGameState();
        belgae = state.belgae;
        arverni = state.arverni;
        aedui = state.aedui;
        romans = state.romans;
        germanic = state.germanic;
        state.turnHistory.startTurn(arverni.id);
    });

    it('spreads but does not march to control, due to exact control in carnutes after spread', function () {
        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id, count: 8});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: carnutesRegion.id, count: 5});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: venetiRegion.id, count: 1});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: pictonesRegion.id, count: 1});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: treveriRegion.id, count: 2});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, count: 6});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, count: 4});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: atrebatesRegion.id, count: 4});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: atrebatesRegion.id, count: 4});

        
        const command = ArverniMarch.march(state, new CommandModifier({noSpecial : true}), 'spread', true);
        command.should.equal(FactionActions.COMMAND);
        expect(arverni.availableWarbands().length).to.equal(25);
        expect(arverni.resources()).to.equal(17);
        expect(carnutesRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(treveriRegion.controllingFactionId()).to.equal(FactionIDs.AEDUI);
    });

    it('spreads and controls treveri with harassment and control in carnutes', function () {
        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id, count: 8});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: venetiRegion.id, count: 1});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: pictonesRegion.id, count: 1});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: treveriRegion.id, count: 2});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, count: 6});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, count: 4});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: atrebatesRegion.id, count: 4});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: atrebatesRegion.id, count: 4});

        ArverniMarch.march(state, new CommandModifier({noSpecial : true}), 'spread', true);
        expect(arverni.availableWarbands().length).to.equal(26);
        expect(arverni.resources()).to.equal(17);
        expect(carnutesRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(treveriRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        treveriRegion.logState();
    });

    it('spreads and controls treveri, with control in carnutes', function () {
        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id, count: 8});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: venetiRegion.id, count: 1});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: pictonesRegion.id, count: 1});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: treveriRegion.id, count: 2});

        ArverniMarch.march(state, new CommandModifier({noSpecial : true}), 'spread', true);
        expect(arverni.availableWarbands().length).to.equal(25);
        expect(arverni.resources()).to.equal(17);
        expect(carnutesRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(treveriRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
    });

    it('spreads and controls treveri, giving up control in carnutes due to spread', function () {
        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id, count: 8});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: carnutesRegion.id, count: 6});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: venetiRegion.id, count: 1});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: pictonesRegion.id, count: 1});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: treveriRegion.id, count: 2});

        ArverniMarch.march(state, new CommandModifier({noSpecial : true}), 'spread', true);
        expect(arverni.availableWarbands().length).to.equal(25);
        expect(arverni.resources()).to.equal(17);
        expect(carnutesRegion.controllingFactionId()).to.equal(FactionIDs.AEDUI);
        expect(treveriRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
    });

    it('spreads and controls considering harassment', function () {
        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id, count: 8});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: carnutesRegion.id, count: 6});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: venetiRegion.id, count: 1});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: pictonesRegion.id, count: 1});

        const nerviiRegion = state.regionsById[RegionIDs.NERVII];
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: nerviiRegion.id, count: 2});

        const sequaniRegion = state.regionsById[RegionIDs.SEQUANI];
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: sequaniRegion.id, count: 2});

        const arverniRegion = state.regionsById[RegionIDs.ARVERNI];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: arverniRegion.id, count: 3});

        const moriniRegion = state.regionsById[RegionIDs.MORINI];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: moriniRegion.id, count: 3});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceWarbands.execute(state, {factionId: germanic.id, regionId: atrebatesRegion.id, count: 4});

        ArverniMarch.march(state, new CommandModifier({noSpecial : true}), 'spread', true);
        expect(arverni.availableWarbands().length).to.equal(19);
        expect(arverni.resources()).to.equal(17);
        expect(carnutesRegion.controllingFactionId()).to.equal(FactionIDs.AEDUI);
        expect(nerviiRegion.controllingFactionId()).to.equal(FactionIDs.AEDUI);
        expect(sequaniRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
    });

    it('considers spread results for control proximity', function () {
        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id, count: 8});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: carnutesRegion.id, count: 6});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: venetiRegion.id, count: 1});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: pictonesRegion.id, count: 1});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: treveriRegion.id, count: 2});

        const sequaniRegion = state.regionsById[RegionIDs.SEQUANI];
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: sequaniRegion.id, count: 2});

        const arverniRegion = state.regionsById[RegionIDs.ARVERNI];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: arverniRegion.id, count: 3});

        const moriniRegion = state.regionsById[RegionIDs.MORINI];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: moriniRegion.id, count: 3});

        ArverniMarch.march(state, new CommandModifier({noSpecial : true}), 'spread', true);
        expect(arverni.availableWarbands().length).to.equal(19);
        expect(arverni.resources()).to.equal(17);
        expect(carnutesRegion.controllingFactionId()).to.equal(FactionIDs.AEDUI);
        expect(treveriRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(sequaniRegion.controllingFactionId()).to.equal(FactionIDs.AEDUI);
    });

    it.skip('does devastation before march to avoid threat', function () {
        arverni.setResources(20);
    });

    it.skip('does entreat before march to avoid threat', function () {
        arverni.setResources(20);
    });

    it('cannot march 2 across rhenus', function() {
        arverni.setResources(20);
        const sugambriRegion = state.regionsById[RegionIDs.SUGAMBRI];
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: sugambriRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: sugambriRegion.id, count: 8});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: atrebatesRegion.id, count: 4});

        ArverniMarch.march(state, new CommandModifier({noSpecial : true}), 'spread', true);
        expect(arverni.availableWarbands().length).to.equal(27);
        expect(arverni.resources()).to.equal(19);


        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        const nerviiRegion = state.regionsById[RegionIDs.NERVII];
        const moriniRegion = state.regionsById[RegionIDs.MORINI];
        const ubiiRegion = state.regionsById[RegionIDs.UBII];

        expect(sugambriRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(ubiiRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(moriniRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(nerviiRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(treveriRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(atrebatesRegion.controllingFactionId()).to.equal(FactionIDs.AEDUI);
    });

    it('cannot march 2 from britannia', function() {
        arverni.setResources(20);
        const britanniaRegion = state.regionsById[RegionIDs.BRITANNIA];
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: britanniaRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: britanniaRegion.id, count: 8});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, count: 4});

        ArverniMarch.march(state, new CommandModifier({noSpecial : true}), 'spread', true);
        expect(arverni.availableWarbands().length).to.equal(27);
        expect(arverni.resources()).to.equal(19);


        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        const moriniRegion = state.regionsById[RegionIDs.MORINI];

        expect(moriniRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(atrebatesRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(venetiRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(mandubiiRegion.controllingFactionId()).to.equal(FactionIDs.AEDUI);
    });

    it('cannot march 2 across devastated', function() {
        arverni.setResources(20);
        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: venetiRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: venetiRegion.id, count: 8});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, count: 4});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        atrebatesRegion.devastated(true);
        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        carnutesRegion.devastated(true);
        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        pictonesRegion.devastated(true);

        ArverniMarch.march(state, new CommandModifier({noSpecial : true}), 'spread', true);
        expect(arverni.availableWarbands().length).to.equal(27);
        expect(arverni.resources()).to.equal(19);

        const britanniaRegion = state.regionsById[RegionIDs.BRITANNIA];

        expect(britanniaRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(carnutesRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(atrebatesRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(venetiRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(pictonesRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(mandubiiRegion.controllingFactionId()).to.equal(FactionIDs.AEDUI);
    });

    it('marches to control legion', function () {
        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id, count: 8});

        const sequaniRegion = state.regionsById[RegionIDs.SEQUANI];
        PlaceLegions.execute(state, {factionId: romans.id, regionId: sequaniRegion.id, count: 2});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: sequaniRegion.id, count: 3});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceLegions.execute(state, {factionId: romans.id, regionId: venetiRegion.id, count: 1});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: venetiRegion.id, count: 8});

        ArverniMarch.march(state, new CommandModifier({noSpecial : true}), 'mass', true);
        expect(arverni.resources()).to.equal(19);
        expect(venetiRegion.controllingFactionId()).to.equal(FactionIDs.ROMANS);
        expect(sequaniRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(sequaniRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(8);
        expect(sequaniRegion.getLeaderForFaction(FactionIDs.ARVERNI)).to.not.be.null;
    });

    it('does not march to control legion if Caesar and too many', function () {
        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id, count: 8});

        const sequaniRegion = state.regionsById[RegionIDs.SEQUANI];
        PlaceLegions.execute(state, {factionId: romans.id, regionId: sequaniRegion.id, count: 2});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: sequaniRegion.id, count: 2});
        PlaceLeader.execute(state, {factionId: romans.id, regionId: sequaniRegion.id});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceLegions.execute(state, {factionId: romans.id, regionId: venetiRegion.id, count: 1});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: venetiRegion.id, count: 8});


        ArverniMarch.march(state, new CommandModifier({noSpecial : true}), 'mass', true);
        expect(arverni.resources()).to.equal(19);
        expect(venetiRegion.controllingFactionId()).to.equal(FactionIDs.ROMANS);
        expect(venetiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(0);
        expect(venetiRegion.getLeaderForFaction(FactionIDs.ARVERNI)).to.be.null;
        expect(sequaniRegion.controllingFactionId()).to.equal(FactionIDs.ROMANS);
        expect(sequaniRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(0);
        expect(sequaniRegion.getLeaderForFaction(FactionIDs.ARVERNI)).to.be.null;
    });

    it('marches to mass near legion', function () {
        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id, count: 8});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceLegions.execute(state, {factionId: romans.id, regionId: treveriRegion.id, count: 2});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: treveriRegion.id, count: 2});
        PlaceLeader.execute(state, {factionId: romans.id, regionId: treveriRegion.id});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 1});

        const aeduiRegion = state.regionsById[RegionIDs.AEDUI];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: aeduiRegion.id, count: 2});

        const sequaniRegion = state.regionsById[RegionIDs.SEQUANI];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: sequaniRegion.id, count: 2});

        const moriniRegion = state.regionsById[RegionIDs.MORINI];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: moriniRegion.id, count: 2});

        const sugambriRegion = state.regionsById[RegionIDs.SUGAMBRI];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: sugambriRegion.id, count: 2});

        ArverniMarch.march(state, new CommandModifier({noSpecial : true}), 'mass', true);

        // Not Nervii or Atrebates because not the most mass
        // Not Mandubii because more marches than Sequani

        expect(arverni.resources()).to.equal(18);
        expect(treveriRegion.controllingFactionId()).to.equal(FactionIDs.ROMANS);
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(1);
        expect(aeduiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(1);
        expect(moriniRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(2);
        expect(sequaniRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(10);
        expect(sugambriRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(2);
    });
});