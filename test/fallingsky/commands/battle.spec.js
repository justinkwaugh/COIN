import _ from 'lib/lodash'
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
import RemovePieces from 'fallingsky/actions/removePieces'
import MovePieces from 'fallingsky/actions/movePieces';

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
        state.playersByFaction[FactionIDs.ROMANS] = new HumanPlayer({factionId: FactionIDs.ROMANS});

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
        turn.addInteraction(interaction);

        try {
            Battle.execute(state, {battleResults: battleResults});
            expect(battleResults.complete).to.equal(true);
        }
        catch (err) {
            throw err;
        }
        expect(mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(0);
        expect(bituriges.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(2);
    });

    it('asks player to take losses w/ no rolls', function () {
        state.playersByFaction[FactionIDs.ROMANS] = new HumanPlayer({factionId: FactionIDs.ROMANS});

        const mandubii = state.regionsById[RegionIDs.MANDUBII];
        const bituriges = state.regionsById[RegionIDs.BITURIGES];

        // Aedui attackers with ambush
        PlaceWarbands.execute(state, {factionId: FactionIDs.AEDUI, regionId: RegionIDs.MANDUBII, count: 8});

        // Roman defenders
        PlaceAuxilia.execute(state, {factionId: FactionIDs.ROMANS, regionId: RegionIDs.MANDUBII, count: 6});

        const battleResults = Battle.test(state, {
            regionId: RegionIDs.MANDUBII,
            attackingFactionId: FactionIDs.AEDUI,
            defendingFactionId: FactionIDs.ROMANS
        });

        state.turnHistory.startTurn(FactionIDs.AEDUI);
        const turn = state.turnHistory.getCurrentTurn();
        turn.startCommand(CommandIDs.BATTLE);

        let interaction = null;
        try {
            battleResults.willAmbush = true;
            Battle.execute(state, {battleResults: battleResults});
        }
        catch (err) {
            expect(err.name).to.equal('PlayerInteractionNeededError');
            expect(err.interaction.type).to.equal('Losses');
            interaction = err.interaction;
        }

        expect(interaction.losses).to.equal(4);

        RemovePieces.execute(state, {
            factionId: romans.id,
            regionId: interaction.regionId,
            pieces: interaction.targets
        });

        expect(mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(2);
        interaction.removed = interaction.targets;
        interaction.caesarCanCounterattack = false;

        turn.addInteraction(interaction);

        try {
            Battle.execute(state,  {battleResults: battleResults});
            expect(battleResults.complete).to.equal(true);
        }
        catch (err) {
            throw err;
        }
        expect(mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(2);
    });

    it('asks player to take losses w/ lucky rolls', function () {
        state.playersByFaction[FactionIDs.ROMANS] = new HumanPlayer({factionId: FactionIDs.ROMANS});

        const mandubii = state.regionsById[RegionIDs.MANDUBII];
        const bituriges = state.regionsById[RegionIDs.BITURIGES];

        // Aedui attackers with ambush
        PlaceWarbands.execute(state, {factionId: FactionIDs.AEDUI, regionId: RegionIDs.MANDUBII, count: 8});
        RevealPieces.execute(state, {factionId: FactionIDs.AEDUI, regionId: RegionIDs.MANDUBII});

        // Roman defenders
        PlaceAuxilia.execute(state, {factionId: FactionIDs.ROMANS, regionId: RegionIDs.MANDUBII, count: 1});
        PlaceLegions.execute(state, {factionId: FactionIDs.ROMANS, regionId: RegionIDs.MANDUBII, count: 1});

        const battleResults = Battle.test(state, {
            regionId: RegionIDs.MANDUBII,
            attackingFactionId: FactionIDs.AEDUI,
            defendingFactionId: FactionIDs.ROMANS
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
            expect(err.interaction.type).to.equal('Losses');
            interaction = err.interaction;
        }

        expect(interaction.losses).to.equal(4);

        const toRemove = _.filter(interaction.targets, {type: 'auxilia'});

        RemovePieces.execute(state, {
            factionId: romans.id,
            regionId: interaction.regionId,
            pieces: toRemove
        });

        expect(mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(0);
        interaction.removed = toRemove;
        interaction.caesarCanCounterattack = false;

        turn.addInteraction(interaction);

        try {
            Battle.execute(state,  {battleResults: battleResults});
            expect(battleResults.complete).to.equal(true);
        }
        catch (err) {
            throw err;
        }
        expect(mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(0);
        expect(mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI).length).to.equal(7);

    });

    it('asks player for retreat declaration and player says yes', function () {
        state.playersByFaction[FactionIDs.ROMANS] = new HumanPlayer({factionId: FactionIDs.ROMANS});

        const mandubii = state.regionsById[RegionIDs.MANDUBII];
        const bituriges = state.regionsById[RegionIDs.BITURIGES];

        // Aedui attackers with ambush
        PlaceWarbands.execute(state, {factionId: FactionIDs.AEDUI, regionId: RegionIDs.MANDUBII, count: 8});
        RevealPieces.execute(state, {factionId: FactionIDs.AEDUI, regionId: RegionIDs.MANDUBII, count: 6});

        // Roman defenders
        PlaceAuxilia.execute(state, {factionId: FactionIDs.ROMANS, regionId: RegionIDs.MANDUBII, count: 2});
        PlaceLegions.execute(state, {factionId: FactionIDs.ROMANS, regionId: RegionIDs.MANDUBII, count: 1});

        // Retreat possibility
        PlaceAuxilia.execute(state, {factionId: FactionIDs.ROMANS, regionId: RegionIDs.BITURIGES, count: 1});

        const battleResults = Battle.test(state, {
            regionId: RegionIDs.MANDUBII,
            attackingFactionId: FactionIDs.AEDUI,
            defendingFactionId: FactionIDs.ROMANS
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
            expect(err.interaction.type).to.equal('RetreatDeclaration');
            interaction = err.interaction;
        }

        interaction.status = 'agreed';
        turn.addInteraction(interaction);

        try {
            Battle.execute(state, {battleResults: battleResults});
        }
        catch (err) {
            expect(err.name).to.equal('PlayerInteractionNeededError');
            expect(err.interaction.type).to.equal('Losses');
            interaction = err.interaction;
        }

        expect(interaction.losses).to.equal(2);

        const toRemove = _.filter(interaction.targets, {type: 'auxilia'});

        RemovePieces.execute(state, {
            factionId: romans.id,
            regionId: interaction.regionId,
            pieces: toRemove
        });

        expect(mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(0);
        interaction.removed = toRemove;
        interaction.caesarCanCounterattack = false;

        turn.addInteraction(interaction);

        try {
            Battle.execute(state, {battleResults: battleResults});
        }
        catch (err) {
            expect(err.name).to.equal('PlayerInteractionNeededError');
            expect(err.interaction.type).to.equal('Retreat');
            interaction = err.interaction;
        }

        MovePieces.execute(state, {
            factionId: romans.id,
            sourceRegionId: interaction.regionId,
            destRegionId: bituriges.id,
            pieces: mandubii.getMobilePiecesForFaction(FactionIDs.ROMANS)
        });


        turn.addInteraction(interaction);

        try {
            Battle.execute(state,  {battleResults: battleResults});
            expect(battleResults.complete).to.equal(true);
        }
        catch (err) {
            throw err;
        }
        expect(mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(0);
        expect(mandubii.getLegions().length).to.equal(0);
        expect(mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI).length).to.equal(8);
        expect(mandubii.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(2);

    });

    it('asks player for retreat declaration and player says no', function () {
        state.playersByFaction[FactionIDs.ROMANS] = new HumanPlayer({factionId: FactionIDs.ROMANS});

        const mandubii = state.regionsById[RegionIDs.MANDUBII];
        const bituriges = state.regionsById[RegionIDs.BITURIGES];

        // Aedui attackers with ambush
        PlaceWarbands.execute(state, {factionId: FactionIDs.AEDUI, regionId: RegionIDs.MANDUBII, count: 8});
        RevealPieces.execute(state, {factionId: FactionIDs.AEDUI, regionId: RegionIDs.MANDUBII, count: 6});

        // Roman defenders
        PlaceAuxilia.execute(state, {factionId: FactionIDs.ROMANS, regionId: RegionIDs.MANDUBII, count: 2});
        PlaceLegions.execute(state, {factionId: FactionIDs.ROMANS, regionId: RegionIDs.MANDUBII, count: 1});

        // Retreat possibility
        PlaceAuxilia.execute(state, {factionId: FactionIDs.ROMANS, regionId: RegionIDs.BITURIGES, count: 1});

        const battleResults = Battle.test(state, {
            regionId: RegionIDs.MANDUBII,
            attackingFactionId: FactionIDs.AEDUI,
            defendingFactionId: FactionIDs.ROMANS
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
            expect(err.interaction.type).to.equal('RetreatDeclaration');
            interaction = err.interaction;
        }

        interaction.status = 'denied';
        turn.addInteraction(interaction);

        try {
            Battle.execute(state, {battleResults: battleResults});
        }
        catch (err) {
            expect(err.name).to.equal('PlayerInteractionNeededError');
            expect(err.interaction.type).to.equal('Losses');
            interaction = err.interaction;
        }

        expect(interaction.losses).to.equal(4);

        const toRemove = _.filter(interaction.targets, {type: 'auxilia'});

        RemovePieces.execute(state, {
            factionId: romans.id,
            regionId: interaction.regionId,
            pieces: toRemove
        });

        expect(mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(0);
        interaction.removed = toRemove;
        interaction.caesarCanCounterattack = false;

        turn.addInteraction(interaction);

        try {
            Battle.execute(state,  {battleResults: battleResults});
            expect(battleResults.complete).to.equal(true);
        }
        catch (err) {
            throw err;
        }
        expect(mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(0);
        expect(mandubii.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI).length).to.equal(7);
        expect(mandubii.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(0);

    });

});