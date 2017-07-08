import _ from 'lib/lodash';
import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState';
import CommandIDs from 'fallingsky/config/commandIds';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import FactionActions from 'common/factionActions';
import TribeIDs from 'fallingsky/config/tribeIds';
import HumanPlayer from 'fallingsky/player/humanPlayer';
import PlaceWarbands from 'fallingsky/actions/placeWarbands';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import PlaceFort from 'fallingsky/actions/placeFort';
import PlaceLeader from 'fallingsky/actions/placeLeader';
import PlaceAuxilia from 'fallingsky/actions/placeAuxilia';
import PlaceLegions from 'fallingsky/actions/placeLegions';
import RevealPieces from 'fallingsky/actions/revealPieces';
import AeduiBattle from 'fallingsky/bots/aedui/aeduiBattle';
import TurnContext from 'common/turnContext';

describe("Aedui Bot", function () {
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

    it('handles retreat request', function () {
        state.playersByFaction[FactionIDs.ROMANS] = new HumanPlayer( {factionId: FactionIDs.ROMANS});
        state.playersByFaction[FactionIDs.ARVERNI] = new HumanPlayer( {factionId: FactionIDs.ARVERNI});

        const aeduiPlayer = state.playersByFaction[FactionIDs.AEDUI];
        aedui.setResources(20);

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, count: 8});
        RevealPieces.execute(state, {factionId: aedui.id, regionId: RegionIDs.MANDUBII});
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.SENONES});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, count: 1});

        // Roman controlled bituriges could be retreat location if agree
        PlaceAuxilia.execute(state, {factionId: FactionIDs.ROMANS, regionId: RegionIDs.BITURIGES, count: 4});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: venetiRegion.id, count: 8});
        RevealPieces.execute(state, {factionId: aedui.id, regionId: RegionIDs.VENETI});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: venetiRegion.id, count: 4});

        // Arverni controlled pictones could be retreat location if agree
        PlaceWarbands.execute(state, {factionId: FactionIDs.ARVERNI, regionId: RegionIDs.PICTONES, count: 4});

        state.turnHistory.startTurn(aedui.id);

        const turn = state.turnHistory.getCurrentTurn();
        _.pull(turn.getContext().allowedCommands, CommandIDs.EVENT);

        let interaction = null;
        try {
            aeduiPlayer.takeTurn(state);
        }
        catch (err) {
            expect(err.name).to.equal('PlayerInteractionNeededError');
            expect(err.interaction.type).to.equal('RetreatAgreement');
            expect(err.interaction.respondingFactionId).to.equal(FactionIDs.ROMANS);
            interaction = err.interaction;
        }
        expect(turn.getContext().context.battles.length).to.equal(2);
        expect(turn.getContext().context.battles[0].complete).to.not.equal(true);
        expect(turn.getContext().context.battles[1].complete).to.not.equal(true);


        interaction.status = 'agreed';
        turn.addInteraction(interaction);

        try {
            aeduiPlayer.resume(state);
        }
        catch (err) {
            expect(err.name).to.equal('PlayerInteractionNeededError');
            expect(err.interaction.type).to.equal('RetreatAgreement');
            expect(err.interaction.respondingFactionId).to.equal(FactionIDs.ARVERNI);
            interaction = err.interaction;
        }
        expect(turn.getContext().context.battles.length).to.equal(2);
        expect(turn.getContext().context.battles[0].complete).to.equal(true);
        expect(turn.getContext().context.battles[1].complete).to.not.equal(true);

        interaction.status = 'agreed';
        turn.addInteraction(interaction);

        aeduiPlayer.resume(state);
        expect(turn.getContext().context.battles).to.equal(null);


    });
});