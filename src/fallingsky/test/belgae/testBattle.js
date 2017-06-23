import _ from '../../../lib/lodash'
import FallingSkyGameState from '../../../fallingsky/state/fallingSkyGameState'
import FactionIDs from '../../../fallingsky/config/factionIds'
import RegionIDs from '../../../fallingsky/config/regionIds'
import TribeIDs from '../../../fallingsky/config/tribeIds'

import PlaceWarbands from '../../../fallingsky/actions/placeWarbands'
import PlaceAlliedTribe from '../../../fallingsky/actions/placeAlliedTribe'
import PlaceFort from '../../../fallingsky/actions/placeFort'
import PlaceLeader from '../../../fallingsky/actions/placeLeader'
import PlaceAuxilia from '../../../fallingsky/actions/placeAuxilia'
import PlaceLegions from '../../../fallingsky/actions/placeLegions'
import RevealPieces from '../../../fallingsky/actions/revealPieces'
import BelgaeBattle from '../../../fallingsky/bots/belgae/belgaeBattle';
import CommandModifier from '../../../fallingsky/commands/commandModifiers';


class TestBattle {
    static run() {
        this.testBattleWithEnlist();
        this.testRomanAmbiorixBattle();
        this.testGallicAmbiorixBattle();
        this.testBattleWithoutAmbiorix();
        this.testBattleWithoutAmbiorixPrioritizeThreat();
        this.testBattleWithAmbush();
        this.testBattleWithoutAmbush();
        this.testBattleAgainstLegions();
        this.testRampageAffectsBattle();
    }

    static testBattleWithEnlist() {
        console.log("\n\n*** testBattleWithEnlist ***");
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        belgae.setResources(20);

        console.log('*** SHOULD BATTLE WITH GERMAN HELP ***');
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.perform(state, {faction: belgae, region: mandubiiRegion});
        PlaceWarbands.perform(state, {faction: belgae, region: mandubiiRegion, count: 3});
        PlaceWarbands.perform(state, {faction: arverni, region: mandubiiRegion, count: 5});
        PlaceAlliedTribe.perform(state, { faction: arverni, region: mandubiiRegion, tribeId: TribeIDs.MANDUBII});
        PlaceAlliedTribe.perform(state, { faction: arverni, region: mandubiiRegion, tribeId: TribeIDs.SENONES});
        PlaceWarbands.perform(state, {faction: germanic, region: mandubiiRegion, count: 4});

        BelgaeBattle.battle(state, new CommandModifier());
    }

    static testRomanAmbiorixBattle() {
        console.log("\n\n*** testRomanAmbiorixBattle ***");
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        belgae.setResources(20);

        console.log('*** SHOULD BATTLE ***');
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.perform(state, {faction: belgae, region: mandubiiRegion});
        PlaceWarbands.perform(state, {faction: belgae, region: mandubiiRegion, count: 5});
        PlaceAuxilia.perform(state, {faction: romans, region: mandubiiRegion, count: 5});
        PlaceWarbands.perform(state, {faction: arverni, region: mandubiiRegion, count: 5});
        BelgaeBattle.battle(state, new CommandModifier());

        console.log('*** SHOULD MARCH ***');
        PlaceAuxilia.perform(state, {faction: romans, region: mandubiiRegion, count: 6});
        BelgaeBattle.battle(state, new CommandModifier());

    }

    static testGallicAmbiorixBattle() {
         console.log("\n\n*** testGallicAmbiorixBattle ***");
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        belgae.setResources(20);

        console.log('*** SHOULD BATTLE ***');
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.perform(state, {faction: belgae, region: mandubiiRegion});
        PlaceWarbands.perform(state, {faction: belgae, region: mandubiiRegion, count: 5});
        PlaceWarbands.perform(state, {faction: arverni, region: mandubiiRegion, count: 8});
        BelgaeBattle.battle(state, new CommandModifier());

        console.log('*** SHOULD MARCH ***');
        PlaceWarbands.perform(state, {faction: arverni, region: mandubiiRegion, count: 6});
        PlaceFort.perform(state, { faction: romans, region: mandubiiRegion});
        BelgaeBattle.battle(state, new CommandModifier());

    }

    static testBattleWithoutAmbiorix() {
         console.log("\n\n*** testBattleWithoutAmbiorix ***");
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        belgae.setResources(20);

        console.log('*** SHOULD BATTLE ROMANS ***');
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.perform(state, {faction: belgae, region: mandubiiRegion, count: 7});
        PlaceWarbands.perform(state, {faction: aedui, region: mandubiiRegion, count: 5});
        PlaceAuxilia.perform(state, {faction: romans, region: mandubiiRegion, count: 4});
        BelgaeBattle.battle(state, new CommandModifier());

    }

    static testBattleWithoutAmbiorixPrioritizeThreat() {
         console.log("\n\n*** testBattleWithoutAmbiorixPrioritizeThreat ***");
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        belgae.setResources(20);

        console.log('*** SHOULD BATTLE AEDUI ***');
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.perform(state, {faction: belgae, region: mandubiiRegion, count: 8});
        PlaceWarbands.perform(state, {faction: aedui, region: mandubiiRegion, count: 5});
        PlaceAuxilia.perform(state, {faction: romans, region: mandubiiRegion, count: 2});
        BelgaeBattle.battle(state, new CommandModifier());

    }

    static testBattleWithAmbush() {
         console.log("\n\n*** testBattleWithAmbush ***");
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        belgae.setResources(20);

        console.log('*** SHOULD BATTLE ROMANS WITH AMBUSH ***');
        console.log('*** SHOULD BATTLE AEDUI WITH AMBUSH ***');
        const biturigesRegion = state.regionsById[RegionIDs.BITURIGES];
        PlaceLeader.perform(state, {faction: belgae, region: biturigesRegion});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.perform(state, {faction: belgae, region: mandubiiRegion, count: 7});
        PlaceAuxilia.perform(state, {faction: romans, region: mandubiiRegion, count: 5});

        const arverniRegion = state.regionsById[RegionIDs.ARVERNI];
        PlaceWarbands.perform(state, {faction: belgae, region: arverniRegion, count: 7});
        PlaceWarbands.perform(state, {faction: aedui, region: arverniRegion, count: 5});

        BelgaeBattle.battle(state, new CommandModifier());

    }

    static testBattleWithoutAmbush() {
         console.log("\n\n*** testBattleWithoutAmbush ***");
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        belgae.setResources(20);

        console.log('*** SHOULD BATTLE AEDUI WITHOUT AMBUSH ***');
        console.log('*** SHOULD BATTLE ROMANS WITHOUT AMBUSH ***');
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.perform(state, {faction: belgae, region: mandubiiRegion, count: 8});
        PlaceWarbands.perform(state, {faction: aedui, region: mandubiiRegion, count: 5});
        PlaceAuxilia.perform(state, {faction: romans, region: mandubiiRegion, count: 2});


        const arverniRegion = state.regionsById[RegionIDs.ARVERNI];
        PlaceWarbands.perform(state, {faction: belgae, region: arverniRegion, count: 7});
        PlaceAuxilia.perform(state, {faction: romans, region: arverniRegion, count: 5});
        BelgaeBattle.battle(state, new CommandModifier());

    }

    static testBattleAgainstLegions() {
         console.log("\n\n*** testBattleAgainstLegions ***");
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        belgae.setResources(20);

        console.log('*** SHOULD BATTLE ROMANS WITH AMBUSH ***');
        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceAlliedTribe.perform(state, { faction: germanic, region: treveriRegion, tribeId: TribeIDs.TREVERI});
        PlaceLeader.perform(state, {faction: belgae, region: treveriRegion});
        PlaceWarbands.perform(state, {faction: belgae, region: treveriRegion, count: 8});
        PlaceWarbands.perform(state, {faction: aedui, region: treveriRegion, count: 1});
        PlaceWarbands.perform(state, {faction: germanic, region: treveriRegion, count: 6});
        PlaceLegions.perform(state, {faction: romans, region: treveriRegion, count: 2});

        BelgaeBattle.battle(state, new CommandModifier());
    }

    static testRampageAffectsBattle() {
        console.log("\n\n*** testRampageAffectsBattle ***");
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];
        const germanic = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        belgae.setResources(20);

        console.log('*** SHOULD BATTLE WITH RAMPAGE ***');
        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceLeader.perform(state, {faction: belgae, region: treveriRegion});
        PlaceWarbands.perform(state, {faction: belgae, region: treveriRegion, count: 8});
        PlaceAuxilia.perform(state, {faction: romans, region: treveriRegion, count: 4});

        BelgaeBattle.battle(state, new CommandModifier());
    }
}

export default TestBattle;