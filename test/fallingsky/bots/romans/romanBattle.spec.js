import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'
import HumanPlayer from 'fallingsky/player/humanPlayer'
import PlaceWarbands from 'fallingsky/actions/placeWarbands'
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe'
import PlaceCitadel from 'fallingsky/actions/placeCitadel'
import PlaceFort from 'fallingsky/actions/placeFort'
import PlaceLeader from 'fallingsky/actions/placeLeader'
import PlaceAuxilia from 'fallingsky/actions/placeAuxilia'
import PlaceLegions from 'fallingsky/actions/placeLegions'
import RevealPieces from 'fallingsky/actions/revealPieces'
import RomanBattle from 'fallingsky/bots/romans/romanBattle';
import TurnContext from 'common/turnContext';

describe("Roman Battle", function () {
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
        state.turnHistory.startTurn(romans.id);
        romans.setResources(20);
        turn = state.turnHistory.getCurrentTurn();
    });

    it('battles because of Caesar and Ally', function () {

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 4});


        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});
        expect(mandubiiRegion.getAlliesForFaction(FactionIDs.ARVERNI).length).to.equal(1);
        RomanBattle.battle(state, turn.getContext());
        expect(mandubiiRegion.getAlliesForFaction(FactionIDs.ARVERNI).length).to.equal(0);
    });

    it('battles because of Caesar and Citadel', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 4});

        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});
        PlaceCitadel.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});

        const context = turn.getContext();
        context.noSpecial = true;
        expect(mandubiiRegion.getCitadelForFaction(FactionIDs.ARVERNI)).to.not.be.null;
        const command = RomanBattle.battle(state, context);
        expect(command).to.equal(FactionActions.COMMAND);
        // We cannot check for removal as the rolls might save it
    });

    it('battles because of Caesar and Leader', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 4});

        PlaceLeader.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id});

        expect(mandubiiRegion.getLeaderForFaction(FactionIDs.ARVERNI)).to.not.be.null;
        const context = turn.getContext();
        context.noSpecial = true;
        const command = RomanBattle.battle(state, context);
        expect(command).to.equal(FactionActions.COMMAND);
        // We cannot check for removal as the rolls might save it
    });


    it('battles because of Caesar and Control', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 4});

        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 6});

        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(6);
        const context = turn.getContext();
        context.noSpecial = true;
        RomanBattle.battle(state, context);
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(5);
    });

    it('battles because of Legions and Ally', function () {

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLegions.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 3});

        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});
        expect(mandubiiRegion.getAlliesForFaction(FactionIDs.ARVERNI).length).to.equal(1);
        RomanBattle.battle(state, turn.getContext());
        expect(mandubiiRegion.getAlliesForFaction(FactionIDs.ARVERNI).length).to.equal(0);
    });

    it('battles because of Legions and Citadel', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLegions.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 3});

        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});
        PlaceCitadel.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});

        const context = turn.getContext();
        context.noSpecial = true;
        expect(mandubiiRegion.getCitadelForFaction(FactionIDs.ARVERNI)).to.not.be.null;
        const command = RomanBattle.battle(state, context);
        expect(command).to.equal(FactionActions.COMMAND);
        // We cannot check for removal as the rolls might save it
    });

    it('battles because of Legions and Leader', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceFort.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id});
        PlaceLegions.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 3});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 1});


        PlaceLeader.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id});

        expect(mandubiiRegion.getLeaderForFaction(FactionIDs.ARVERNI)).to.not.be.null;
        const context = turn.getContext();
        context.noSpecial = true;
        const command = RomanBattle.battle(state, context);
        expect(command).to.equal(FactionActions.COMMAND);
        // We cannot check for removal as the rolls might save it
    });

    it('battles because of Legions and Control', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceFort.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id});
        PlaceLegions.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 4});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 4});

        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 10});

        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(10);
        const context = turn.getContext();
        context.noSpecial = true;
        RomanBattle.battle(state, context);
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(7);
    });

    it('battles because of loss to Legions', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLegions.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 4});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 4});

        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(4);
        const context = turn.getContext();
        context.noSpecial = true;
        RomanBattle.battle(state, context);
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(2);
    });

    it('marches because of loss to Legions', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLegions.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 4});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 6});

        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(6);
        const context = turn.getContext();
        context.noSpecial = true;
        const command = RomanBattle.battle(state, context);
        expect(command).to.equal(false);
        expect(context.context.tryThreatMarch).to.equal(true);
        expect(context.context.threatRegions[0]).to.equal(mandubiiRegion.id);
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(6);
    });

    it('marches because of loss to Caesar', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 6});

        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(6);
        const context = turn.getContext();
        context.noSpecial = true;
        const command = RomanBattle.battle(state, context);
        expect(command).to.equal(false);
        expect(context.context.tryThreatMarch).to.equal(true);
        expect(context.context.threatRegions[0]).to.equal(mandubiiRegion.id);
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(6);
    });

    it('prefers Leader battles', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id});
        PlaceLegions.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 8});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 4});
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.LINGONES});
        PlaceAlliedTribe.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.SENONES});
        PlaceAlliedTribe.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, count: 4});
        PlaceWarbands.execute(state, {factionId: germanic.id, regionId: mandubiiRegion.id, count: 2});

        const context = turn.getContext();
        context.noSpecial = true;
        const command = RomanBattle.battle(state, context);
        expect(command).to.equal(FactionActions.COMMAND);
        expect(mandubiiRegion.getAlliesForFaction(FactionIDs.ARVERNI).length).to.equal(0);
        expect(mandubiiRegion.getAlliesForFaction(FactionIDs.AEDUI).length).to.equal(2);
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.BELGAE).length).to.equal(4);
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.GERMANIC_TRIBES).length).to.equal(2);

    });

    it('prefers most Ally battles', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id});
        PlaceLegions.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 8});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 4});
        PlaceLeader.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id});
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.LINGONES});
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.SENONES});
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, count: 2});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 4});

        const context = turn.getContext();
        context.noSpecial = true;
        const command = RomanBattle.battle(state, context);
        expect(command).to.equal(FactionActions.COMMAND);
        expect(mandubiiRegion.getAlliesForFaction(FactionIDs.ARVERNI).length).to.equal(1);
        expect(mandubiiRegion.getAlliesForFaction(FactionIDs.BELGAE).length).to.equal(0);
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.BELGAE).length).to.equal(0);
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(4);

    });

    it('prefers most Warband battles', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id});
        PlaceLegions.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 8});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 4});
        PlaceLeader.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id});
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.LINGONES});
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.SENONES});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, count: 4});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 2});

        const context = turn.getContext();
        context.noSpecial = true;
        const command = RomanBattle.battle(state, context);
        expect(command).to.equal(FactionActions.COMMAND);
        expect(mandubiiRegion.getAlliesForFaction(FactionIDs.ARVERNI).length).to.equal(1);
        expect(mandubiiRegion.getAlliesForFaction(FactionIDs.BELGAE).length).to.equal(0);
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.BELGAE).length).to.equal(0);
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(2);

    });

    it('prefers victory margin', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id});
        PlaceLegions.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 8});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 4});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.LINGONES});
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.SENONES});

        const context = turn.getContext();
        context.noSpecial = true;
        const command = RomanBattle.battle(state, context);
        expect(command).to.equal(FactionActions.COMMAND);
        expect(mandubiiRegion.getAlliesForFaction(FactionIDs.ARVERNI).length).to.equal(0);
        expect(mandubiiRegion.getAlliesForFaction(FactionIDs.BELGAE).length).to.equal(1);

    });

    it('prefers players', function () {
        state.playersByFaction[FactionIDs.BELGAE] = new HumanPlayer( {factionId: FactionIDs.BELGAE});
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id});
        PlaceLegions.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 8});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 4});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.LINGONES});
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.SENONES});


        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: atrebatesRegion.id, tribeId: TribeIDs.ATREBATES});
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: atrebatesRegion.id, tribeId: TribeIDs.BELLOVACI});
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: atrebatesRegion.id, tribeId: TribeIDs.REMI});

        const britanniaRegion = state.regionsById[RegionIDs.BRITANNIA];
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: britanniaRegion.id, count: 1});

        const context = turn.getContext();
        context.noSpecial = true;
        try {
            const command = RomanBattle.battle(state, context);
        }
        catch (err) {
            expect(err.name).to.equal('PlayerInteractionNeededError');
            expect(err.interaction.type).to.equal('Losses');
            expect(err.interaction.respondingFactionId).to.equal(FactionIDs.BELGAE);
        }

    });

    it('besieges citadel', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLegions.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 2});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});
        PlaceCitadel.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});

        const context = turn.getContext();
        const command = RomanBattle.battle(state, context);
        expect(command).to.equal(FactionActions.COMMAND_AND_SPECIAL);
        expect(mandubiiRegion.getCitadelForFaction(FactionIDs.ARVERNI)).to.be.null;
    });

    it('besieges ally', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLegions.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 1});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.SENONES});

        const context = turn.getContext();
        const command = RomanBattle.battle(state, context);
        expect(command).to.equal(FactionActions.COMMAND_AND_SPECIAL);
        expect(mandubiiRegion.getAlliesForFaction(FactionIDs.ARVERNI).length).to.equal(0);
    });

    it('does not besiege citadel', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLegions.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 6});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});
        PlaceCitadel.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});

        const context = turn.getContext();
        const command = RomanBattle.battle(state, context);
        expect(command).to.equal(FactionActions.COMMAND);
    });

    it('does not ignore threat', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceFort.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id});
        PlaceLegions.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 8});
        PlaceAlliedTribe.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.LINGONES});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.SENONES});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, count: 2});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 16});
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id});

        const context = turn.getContext();
        const command = RomanBattle.battle(state, context);
        expect(command).to.equal(false);
        expect(context.context.tryThreatMarch).to.equal(true);
        expect(context.context.threatRegions[0]).to.equal(mandubiiRegion.id);
    });

    // This rule is unclear
    // it('does not ignore double threat', function () {
    //     const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
    //     PlaceLegions.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 8});
    //     PlaceAlliedTribe.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.LINGONES});
    //     PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.SENONES});
    //     PlaceWarbands.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, count: 2});
    //     PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 16});
    //     PlaceLeader.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id});
    //
    //     const context = turn.getContext();
    //     const command = RomanBattle.battle(state, context);
    //     expect(command).to.equal(false);
    //     expect(context.context.tryThreatMarch).to.equal(true);
    //     expect(context.context.threatRegions[0]).to.equal(mandubiiRegion.id);
    // });
});