import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'
import HumanPlayer from 'fallingsky/player/humanPlayer'
import PlaceWarbands from 'fallingsky/actions/placeWarbands'
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe'
import PlaceFort from 'fallingsky/actions/placeFort'
import PlaceLeader from 'fallingsky/actions/placeLeader'
import PlaceAuxilia from 'fallingsky/actions/placeAuxilia'
import PlaceLegions from 'fallingsky/actions/placeLegions'
import RevealPieces from 'fallingsky/actions/revealPieces'
import BelgaeMarch from 'fallingsky/bots/belgae/belgaeMarch';
import TurnContext from 'common/turnContext';

describe("Belgae March", function () {
    let state;
    let belgae;
    let arverni;
    let aedui;
    let romans;
    let germanic;
    let turn;

    beforeEach(function () {
        state = new FallingSkyGameState();
        belgae = state.belgae;
        arverni = state.arverni;
        aedui = state.aedui;
        romans = state.romans;
        germanic = state.germanic;
        state.turnHistory.startTurn(belgae.id);
        belgae.setResources(20);
        turn = state.turnHistory.getCurrentTurn();
    });

    it('wants to threat march, fewest regions is pair and one', function () {
        const sugambriRegion = state.regionsById[RegionIDs.SUGAMBRI];
        PlaceLeader.execute(state, {factionId: belgae.id, regionId: sugambriRegion.id});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: sugambriRegion.id, count: 5});

        const nerviiRegion = state.regionsById[RegionIDs.NERVII];
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: nerviiRegion.id, count: 5});

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: carnutesRegion.id, count: 5});

        const context = turn.getContext();
        context.context.tryThreatMarch = true;
        context.context.threatRegions = [RegionIDs.SUGAMBRI,RegionIDs.NERVII,RegionIDs.CARNUTES];

        const command = BelgaeMarch.march(state, turn.getContext());

        // Need to make it pick something specific and do assertions
    });

    it('wants to threat march, fewest regions is one and one', function () {
        const sugambriRegion = state.regionsById[RegionIDs.SUGAMBRI];
        PlaceLeader.execute(state, {factionId: belgae.id, regionId: sugambriRegion.id});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: sugambriRegion.id, count: 5});

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: carnutesRegion.id, count: 5});

        const context = turn.getContext();
        context.context.tryThreatMarch = true;
        context.context.threatRegions = [RegionIDs.SUGAMBRI,RegionIDs.NERVII,RegionIDs.CARNUTES];

        const command = BelgaeMarch.march(state, turn.getContext());
        // Need to make it pick something specific and do assertions
    });
});