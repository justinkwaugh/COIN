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
    });

    it('spreads but does not march to control, due to exact control in carnutes after spread', function () {
        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.perform(state, {faction: arverni, region: carnutesRegion});
        PlaceWarbands.perform(state, {faction: arverni, region: carnutesRegion, count: 8});
        PlaceWarbands.perform(state, {faction: aedui, region: carnutesRegion, count: 5});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceWarbands.perform(state, {faction: arverni, region: venetiRegion, count: 1});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceWarbands.perform(state, {faction: arverni, region: pictonesRegion, count: 1});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceWarbands.perform(state, {faction: aedui, region: treveriRegion, count: 2});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.perform(state, {faction: aedui, region: mandubiiRegion, count: 6});
        PlaceWarbands.perform(state, {faction: belgae, region: mandubiiRegion, count: 4});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceWarbands.perform(state, {faction: belgae, region: atrebatesRegion, count: 4});
        PlaceWarbands.perform(state, {faction: aedui, region: atrebatesRegion, count: 4});

        const command = ArverniMarch.march(state, new CommandModifier(), 'spread', true);
        command.should.equal(FactionActions.COMMAND);
        expect(arverni.availableWarbands().length).to.equal(25);
        expect(arverni.resources()).to.equal(17);
        expect(carnutesRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(treveriRegion.controllingFactionId()).to.equal(FactionIDs.AEDUI);
    });

    it('spreads and controls treveri with harassment and control in carnutes', function () {
        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.perform(state, {faction: arverni, region: carnutesRegion});
        PlaceWarbands.perform(state, {faction: arverni, region: carnutesRegion, count: 8});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceWarbands.perform(state, {faction: arverni, region: venetiRegion, count: 1});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceWarbands.perform(state, {faction: arverni, region: pictonesRegion, count: 1});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceWarbands.perform(state, {faction: aedui, region: treveriRegion, count: 2});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.perform(state, {faction: aedui, region: mandubiiRegion, count: 6});
        PlaceWarbands.perform(state, {faction: belgae, region: mandubiiRegion, count: 4});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceWarbands.perform(state, {faction: belgae, region: atrebatesRegion, count: 4});
        PlaceWarbands.perform(state, {faction: aedui, region: atrebatesRegion, count: 4});

        ArverniMarch.march(state, new CommandModifier(), 'spread', true);
        expect(arverni.availableWarbands().length).to.equal(26);
        expect(arverni.resources()).to.equal(17);
        expect(carnutesRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(treveriRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        treveriRegion.logState();
    });

    it('spreads and controls treveri, with control in carnutes', function () {
        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.perform(state, {faction: arverni, region: carnutesRegion});
        PlaceWarbands.perform(state, {faction: arverni, region: carnutesRegion, count: 8});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceWarbands.perform(state, {faction: arverni, region: venetiRegion, count: 1});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceWarbands.perform(state, {faction: arverni, region: pictonesRegion, count: 1});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceAuxilia.perform(state, {faction: romans, region: treveriRegion, count: 2});

        ArverniMarch.march(state, new CommandModifier(), 'spread', true);
        expect(arverni.availableWarbands().length).to.equal(25);
        expect(arverni.resources()).to.equal(17);
        expect(carnutesRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
        expect(treveriRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
    });

    it('spreads and controls treveri, giving up control in carnutes due to spread', function () {
        arverni.setResources(20);

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceLeader.perform(state, {faction: arverni, region: carnutesRegion});
        PlaceWarbands.perform(state, {faction: arverni, region: carnutesRegion, count: 8});
        PlaceWarbands.perform(state, {faction: aedui, region: carnutesRegion, count: 6});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceWarbands.perform(state, {faction: arverni, region: venetiRegion, count: 1});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceWarbands.perform(state, {faction: arverni, region: pictonesRegion, count: 1});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceWarbands.perform(state, {faction: aedui, region: treveriRegion, count: 2});

        ArverniMarch.march(state, new CommandModifier(), 'spread', true);
        expect(arverni.availableWarbands().length).to.equal(25);
        expect(arverni.resources()).to.equal(17);
        expect(carnutesRegion.controllingFactionId()).to.equal(FactionIDs.AEDUI);
        expect(treveriRegion.controllingFactionId()).to.equal(FactionIDs.ARVERNI);
    });

});