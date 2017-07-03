import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import CommandIDs from 'fallingsky/config/commandIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'
import HumanPlayer from 'fallingsky/player/humanPlayer'

import Battle from 'fallingsky/commands/battle'
import PlaceWarbands from 'fallingsky/actions/placeWarbands'
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe'
import PlaceFort from 'fallingsky/actions/placeFort'
import PlaceLeader from 'fallingsky/actions/placeLeader'
import PlaceAuxilia from 'fallingsky/actions/placeAuxilia'
import PlaceLegions from 'fallingsky/actions/placeLegions'
import RevealPieces from 'fallingsky/actions/revealPieces'

describe("Battle", function () {
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

    it('asks player for retreat', function () {
        state.playersByFaction[FactionIDs.ROMANS] = new HumanPlayer( {factionId: FactionIDs.ROMANS});

        const mandubii = state.regionsById[RegionIDs.MANDUBII];
        const bituriges = state.regionsById[RegionIDs.BITURIGES];

        // Aedui attackers with no chance for ambush
        PlaceWarbands.execute(state, {factionId: FactionIDs.AEDUI, regionId: RegionIDs.MANDUBII, count: 8});
        RevealPieces.execute(state, {factionId: FactionIDs.AEDUI, regionId: RegionIDs.MANDUBII});

        // Arverni defenders
        PlaceWarbands.execute(state, {factionId: FactionIDs.ARVERNI, regionId: RegionIDs.MANDUBII, count: 4});

        // Roman controlled bituriges could be retreat location if agree
        PlaceAuxilia.execute(state, {factionId: FactionIDs.ROMANS, regionId: RegionIDs.BITURIGES, count: 4});

        const battleResults = Battle.test(state, {
            regionId: RegionIDs.MANDUBII,
            attackingFactionId: FactionIDs.AEDUI,
            defendingFactionId: FactionIDs.ARVERNI
        });

        state.turnHistory.startTurn(FactionIDs.AEDUI);
        const turn = state.turnHistory.getCurrentTurn();
        turn.startCommand(CommandIDs.BATTLE);

        let interaction = null;
        try {
            Battle.execute(state, {battleResults: battleResults});
        }
        catch (err) {
            expect(err.name).to.equal('PlayerInteractionNeededError');
            expect(err.interaction.type).to.equal('RetreatAgreement');
            interaction = err.interaction;
        }
        expect(mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(4);
        interaction.status = 'agreed';
        turn.addAgreement(interaction);

        try {
            Battle.execute(state,  {battleResults: battleResults});
            expect(battleResults.complete).to.equal(true);
        }
        catch (err) {
            throw err;
        }
        expect(mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(0);
        expect(bituriges.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(2);
    });

    it.skip('asks player to take losses', function () {
        state.playersByFaction[FactionIDs.ROMANS] = new HumanPlayer( {factionId: FactionIDs.ROMANS});

        const mandubii = state.regionsById[RegionIDs.MANDUBII];
        const bituriges = state.regionsById[RegionIDs.BITURIGES];

        // Aedui attackers with no chance for ambush
        PlaceWarbands.execute(state, {factionId: FactionIDs.AEDUI, regionId: RegionIDs.MANDUBII, count: 8});
        RevealPieces.execute(state, {factionId: FactionIDs.AEDUI, regionId: RegionIDs.MANDUBII});

        // Arverni defenders
        PlaceWarbands.execute(state, {factionId: FactionIDs.ARVERNI, regionId: RegionIDs.MANDUBII, count: 4});

        const battleResults = Battle.test(state, {
            regionId: RegionIDs.MANDUBII,
            attackingFactionId: FactionIDs.AEDUI,
            defendingFactionId: FactionIDs.ARVERNI
        });

        state.turnHistory.startTurn(FactionIDs.AEDUI);
        const turn = state.turnHistory.getCurrentTurn();
        turn.startCommand(CommandIDs.BATTLE);

        let interaction = null;
        try {
            Battle.execute(state, {battleResults: battleResults});
        }
        catch (err) {
            expect(err.name).to.equal('PlayerInteractionNeededError');
            expect(err.interaction.type).to.equal('RetreatAgreement');
            interaction = err.interaction;
        }
        expect(mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(4);
        interaction.status = 'agreed';
        turn.addAgreement(interaction);

        try {
            Battle.execute(state,  {battleResults: battleResults});
            expect(battleResults.complete).to.equal(true);
        }
        catch (err) {
            throw err;
        }
        expect(mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(0);
        expect(bituriges.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(2);
    });

});