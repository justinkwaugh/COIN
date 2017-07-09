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
import BelgaeBattle from 'fallingsky/bots/belgae/belgaeBattle';
import TurnContext from 'common/turnContext';

describe("Belgae Battle", function () {
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

    it('battles with german help', function () {

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, count: 3});
        RevealPieces.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 5});
        PlaceAlliedTribe.execute(state,
                                 {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});
        PlaceAlliedTribe.execute(state,
                                 {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.SENONES});
        PlaceWarbands.execute(state, {factionId: germanic.id, regionId: mandubiiRegion.id, count: 4});

        BelgaeBattle.battle(state, turn.getContext());

        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(0);
        expect(mandubiiRegion.getAlliesForFaction(FactionIDs.ARVERNI).length).to.equal(0);
    });

    it('battles romans with ambiorix', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, count: 5});
        RevealPieces.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 5});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 5});
        BelgaeBattle.battle(state, turn.getContext());
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(0);
    });

    it('wants to march away from roman threat with ambiorix', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, count: 5});
        RevealPieces.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 11});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 5});
        const command = BelgaeBattle.battle(state, turn.getContext());
        expect(command).to.equal(false);
        expect(turn.getContext().context.tryThreatMarch).to.equal(true);
        expect(turn.getContext().context.threatRegions.length).to.equal(1);
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(11);
    });


    it('battles gauls with ambiorix', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, count: 5});
        RevealPieces.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 8});

        BelgaeBattle.battle(state, turn.getContext());

        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(2);
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.BELGAE).length).to.equal(4);

    });

    it('wants to march away from gallic threat with ambiorix', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, count: 5});
        RevealPieces.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 14});
        PlaceFort.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id});

        const command = BelgaeBattle.battle(state, turn.getContext());
        expect(command).to.equal(false);
        expect(turn.getContext().context.tryThreatMarch).to.equal(true);
        expect(turn.getContext().context.threatRegions.length).to.equal(1);
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length).to.equal(14);
    });


    it('battles without ambiorix, prioritize romans', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, count: 7});
        RevealPieces.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, count: 5});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 4});
        BelgaeBattle.battle(state, turn.getContext());

        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(1);
    });

    it('battles without ambiorix, prioritize threat', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, count: 8});
        RevealPieces.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, count: 5});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 2});
        BelgaeBattle.battle(state, turn.getContext());

        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI).length).to.equal(1);
    });

    it('battles with ambushes', function () {

        const biturigesRegion = state.regionsById[RegionIDs.BITURIGES];
        PlaceLeader.execute(state, {factionId: belgae.id, regionId: biturigesRegion.id});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, count: 7});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 5});

        const arverniRegion = state.regionsById[RegionIDs.ARVERNI];
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: arverniRegion.id, count: 7});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: arverniRegion.id, count: 5});

        const aeduiRegion = state.regionsById[RegionIDs.AEDUI];
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: aeduiRegion.id, count: 2});

        const context = turn.getContext();
        BelgaeBattle.battle(state, context);
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(2);
        expect(aeduiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(2);
        expect(arverniRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI).length).to.equal(2);

    });

    it('battles without ambushes', function () {
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, count: 16});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, count: 4});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: mandubiiRegion.id, count: 2});

        const arverniRegion = state.regionsById[RegionIDs.ARVERNI];
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: arverniRegion.id, count: 7});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: arverniRegion.id, count: 3});

        const aeduiRegion = state.regionsById[RegionIDs.AEDUI];
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: aeduiRegion.id, count: 2});

        const biturigesRegion = state.regionsById[RegionIDs.BITURIGES];
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: biturigesRegion.id, count: 2});

        BelgaeBattle.battle(state, turn.getContext());
        expect(mandubiiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI).length).to.equal(0);
        expect(aeduiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI).length).to.equal(2);
        expect(arverniRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(0);
        expect(biturigesRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(4);

    });

    it('battles against legions', function () {
        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceAlliedTribe.execute(state,
                                 {factionId: germanic.id, regionId: treveriRegion.id, tribeId: TribeIDs.TREVERI});
        PlaceLeader.execute(state, {factionId: belgae.id, regionId: treveriRegion.id});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: treveriRegion.id, count: 8});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: treveriRegion.id, count: 1});
        PlaceWarbands.execute(state, {factionId: germanic.id, regionId: treveriRegion.id, count: 6});
        PlaceLegions.execute(state, {factionId: romans.id, regionId: treveriRegion.id, count: 2});

        BelgaeBattle.battle(state, turn.getContext());
        expect(treveriRegion.getLegions().length).to.equal(0);
    });

    it('battles with rampage affecting counts, but not last', function () {
        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceLeader.execute(state, {factionId: belgae.id, regionId: treveriRegion.id});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: treveriRegion.id, count: 8});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: treveriRegion.id, count: 4});

        expect(BelgaeBattle.battle(state, turn.getContext())).to.equal(FactionActions.COMMAND_AND_SPECIAL);
        expect(treveriRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(0);
    });
});