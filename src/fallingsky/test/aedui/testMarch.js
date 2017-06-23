define(function (require) {
    'use strict';

    var Selfish = require('lib/selfish');
    var _ = require('lib/lodash');
    var FallingSkyGameState = require('fallingsky/state/fallingSkyGameState');
    var Factions = require('fallingsky/config/factions');
    var Regions = require('fallingsky/config/regions');
    var Tribes = require('fallingsky/config/tribes');

    var PlaceWarbands = require('fallingsky/actions/placeWarbands');
    var PlaceAlliedTribe = require('fallingsky/actions/placeAlliedTribe');
    var PlaceCitadel = require('fallingsky/actions/placeCitadel');
    var PlaceLeader = require('fallingsky/actions/placeLeader');
    var PlaceAuxilia = require('fallingsky/actions/placeAuxilia');
    var PlaceFort = require('fallingsky/actions/placeFort');
    var PlaceLegions = require('fallingsky/actions/placeLegions');

    var Suborn = require('fallingsky/commands/aedui/suborn');

    var AeduiBot = require('fallingsky/bots/aedui/aeduiBot');
    var AeduiMarch = require('fallingsky/bots/aedui/aeduiMarch');

    var TestMarch = Selfish.Base.extend({
        initialize: function initialize(definition) {
            var that = this;
        },
        run: function run() {
            var state = FallingSkyGameState.create();

            var belgae = state.factionsById[Factions.FactionIDs.BELGAE];
            var arverni = state.factionsById[Factions.FactionIDs.ARVERNI];
            var aedui = state.factionsById[Factions.FactionIDs.AEDUI];
            var romans = state.factionsById[Factions.FactionIDs.ROMANS];
            var germanic = state.factionsById[Factions.FactionIDs.GERMANIC_TRIBES];

            aedui.setResources(20);
            belgae.setResources(10);
            arverni.setResources(10);

            var aeduiRegion = state.regionsById[Regions.RegionIDs.AEDUI];
            PlaceWarbands.perform(state, { faction: arverni, region: aeduiRegion, count: 1});

            var mandubiiRegion = state.regionsById[Regions.RegionIDs.MANDUBII];
            PlaceAlliedTribe.perform(state, { faction: aedui, region: mandubiiRegion, tribeId : Tribes.TribeIDs.SENONES});
            PlaceWarbands.perform(state, { faction: aedui, region: mandubiiRegion, count: 4});

            var atrebatesRegion = state.regionsById[Regions.RegionIDs.ATREBATES];
            PlaceAlliedTribe.perform(state, { faction: belgae, region: atrebatesRegion, tribeId: Tribes.TribeIDs.BELLOVACI});
            PlaceWarbands.perform(state, { faction: belgae, region: atrebatesRegion, count: 5});

            var arverniRegion = state.regionsById[Regions.RegionIDs.ARVERNI];
            PlaceAlliedTribe.perform(state, { faction: arverni, region: arverniRegion, tribeId: Tribes.TribeIDs.BELLOVACI});
            PlaceAlliedTribe.perform(state, { faction: arverni, region: arverniRegion, tribeId: Tribes.TribeIDs.CADURCI});

            var sequaniRegion = state.regionsById[Regions.RegionIDs.SEQUANI];
            PlaceAlliedTribe.perform(state, { faction: arverni, region: sequaniRegion, tribeId: Tribes.TribeIDs.SEQUANI});

            var venetiRegion = state.regionsById[Regions.RegionIDs.VENETI];
            PlaceWarbands.perform(state, { faction: aedui, region: venetiRegion, count: 2});

            var carnutesRegion = state.regionsById[Regions.RegionIDs.CARNUTES];
            PlaceWarbands.perform(state, { faction: arverni, region: carnutesRegion, count: 1});

            var britanniaRegion = state.regionsById[Regions.RegionIDs.BRITANNIA];
            PlaceWarbands.perform(state, { faction: arverni, region: britanniaRegion, count: 5});

            var pictonesRegion = state.regionsById[Regions.RegionIDs.PICTONES];
            PlaceWarbands.perform(state, { faction: arverni, region: pictonesRegion, count: 5});

            var biturigesRegion = state.regionsById[Regions.RegionIDs.BITURIGES];
            PlaceWarbands.perform(state, { faction: arverni, region: biturigesRegion, count: 1});

            var treveriRegion = state.regionsById[Regions.RegionIDs.TREVERI];
            PlaceWarbands.perform(state, { faction: arverni, region: treveriRegion, count: 5});

            state.logState();
            var bot = AeduiBot.create();

            var marched = AeduiMarch.march(state, bot, aedui);
        }
    });

    return TestMarch;
});