import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import Event72 from 'fallingsky/bots/belgae/events/event72';
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
import BelgaeBattle from 'fallingsky/bots/belgae/belgaeBattle';
import TurnContext from 'common/turnContext';

describe("Event 72", function () {
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

    it('marches and battles', function () {

        state.playersByFaction[FactionIDs.ARVERNI] = new HumanPlayer( {factionId: FactionIDs.ARVERNI});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, count: 4});

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id, count: 8});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: carnutesRegion.id, count: 8});


        const turn = state.turnHistory.getCurrentTurn();
        let interaction = null;
        try {
            Event72.handleEvent(state);
        }
        catch (err) {
            expect(err.name).to.equal('PlayerInteractionNeededError');
            expect(err.interaction.type).to.equal('RetreatDeclaration');
            interaction = err.interaction;
        }

        interaction.status = 'agreed';
        turn.addInteraction(interaction);

        try {
            state.turnHistory.currentTurn.resume();
            Event72.handleEvent(state);
        }
        catch (err) {
            expect(err.name).to.equal('PlayerInteractionNeededError');
            expect(err.interaction.type).to.equal('Losses');
            expect(err.interaction.respondingFactionId).to.equal(FactionIDs.ARVERNI);
            expect(err.interaction.losses).to.equal(1);
        }
    });
});