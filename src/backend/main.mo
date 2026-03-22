import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  module Category {
    public type Type = {
      #mass_songs;
      #marian_hymns;
      #advent;
      #lent;
      #easter;
      #general_devotion;
    };

    public func toText(category : Type) : Text {
      switch (category) {
        case (#mass_songs) { "Mass Songs" };
        case (#marian_hymns) { "Marian Hymns" };
        case (#advent) { "Advent" };
        case (#lent) { "Lent" };
        case (#easter) { "Easter" };
        case (#general_devotion) { "General Devotion" };
      };
    };
  };

  type SongId = Nat;

  module SongId {
    public func compare(x : SongId, y : SongId) : Order.Order {
      Nat.compare(x, y);
    };
  };

  type Section = {
    title : Text;
    lyrics : [Text];
  };

  type Song = {
    id : SongId;
    title : Text;
    composer : Text;
    category : Category.Type;
    lyrics : [Section];
    musicSheet : ?Storage.ExternalBlob;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type SongInput = {
    title : Text;
    composer : Text;
    category : Category.Type;
    lyrics : [Section];
    musicSheet : ?Storage.ExternalBlob;
  };

  module Song {
    public func toText(song : Song) : Text {
      song.title;
    };
  };

  module SongUtils {
    public func compareByUpdatedAt(song1 : Song, song2 : Song) : Order.Order {
      Int.compare(song1.updatedAt, song2.updatedAt);
    };
  };

  let songs = Map.empty<SongId, Song>();

  var songIdCounter = 0;

  func getNextId() : SongId {
    let id = songIdCounter;
    songIdCounter += 1;
    id;
  };

  // Retrieve a song by id or trap if not found
  func getSongInternal(id : SongId) : Song {
    switch (songs.get(id)) {
      case (?song) { song };
      case (null) { Runtime.trap("Song with id " # id.toText() # " does not exist.") };
    };
  };

  // Mixins for auth an blob logic
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Create a new song (admin only)
  public shared ({ caller }) func addSong(songInput : SongInput) : async SongId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can create songs");
    };
    if (songInput.title.size() == 0) {
      Runtime.trap("Song should not have an empty title.");
    };
    let id = getNextId();
    let song : Song = {
      id;
      title = songInput.title;
      composer = songInput.composer;
      category = songInput.category;
      lyrics = songInput.lyrics;
      musicSheet = songInput.musicSheet;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    songs.add(id, song);
    id;
  };

  // Update an existing song (admin only)
  public shared ({ caller }) func updateSong(id : SongId, songInput : SongInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update songs");
    };
    let existingSong = getSongInternal(id);
    let updatedSong : Song = {
      id = existingSong.id;
      title = songInput.title;
      composer = songInput.composer;
      category = songInput.category;
      lyrics = songInput.lyrics;
      musicSheet = songInput.musicSheet;
      createdAt = existingSong.createdAt;
      updatedAt = Time.now();
    };
    songs.add(id, updatedSong);
  };

  // Delete a song (admin only)
  public shared ({ caller }) func deleteSong(id : SongId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete songs");
    };
    let song = getSongInternal(id);
    songs.remove(id);
  };

  // Get a song by id (public)
  public query ({ caller }) func getSong(id : SongId) : async Song {
    getSongInternal(id);
  };

  // Get all songs (public)
  public query ({ caller }) func getAllSongs() : async [Song] {
    songs.values().toArray().sort(SongUtils.compareByUpdatedAt);
  };

  // Search songs by title (public)
  public query ({ caller }) func searchSongsByTitle(searchTerm : Text) : async [Song] {
    let lowerSearchTerm = searchTerm.toLower();
    songs.values().toArray().filter(func(s) { s.title.toLower().contains(#text lowerSearchTerm) });
  };

  // Get songs by category (public)
  public query ({ caller }) func getSongsByCategory(category : Category.Type) : async [Song] {
    songs.values().toArray().filter(func(s) { s.category == category });
  };

  // Seed data: Only called if no songs exist yet
  func seedSongs() {
    if (songs.values().toArray().size() > 0) {
      return;
    };
    let seedSongs : [SongInput] = [
      {
        title = "Ave Maria";
        composer = "Franz Schubert";
        category = #marian_hymns;
        lyrics = [
          {
            title = "Verse 1";
            lyrics = [
              "Ave Maria, Gratia plena",
              "Maria, gratia plena",
              "Maria, gratia plena",
              "Ave, ave dominus",
              "Dominus tecum",
            ];
          },
        ];
        musicSheet = null;
      },
      {
        title = "Holy, Holy, Holy";
        composer = "Reginald Heber";
        category = #mass_songs;
        lyrics = [
          {
            title = "Verse 1";
            lyrics = [
              "Holy, holy, holy",
              "Lord God Almighty",
              "Early in the morning",
              "Our song shall rise to thee",
            ];
          },
        ];
        musicSheet = null;
      },
      {
        title = "Amazing Grace";
        composer = "John Newton";
        category = #general_devotion;
        lyrics = [
          {
            title = "Verse 1";
            lyrics = [
              "Amazing grace, how sweet the sound",
              "That saved a wretch like me",
              "I once was lost, but now am found",
              "Was blind, but now I see",
            ];
          },
        ];
        musicSheet = null;
      },
      {
        title = "Salve Regina";
        composer = "Catholic Hymn";
        category = #marian_hymns;
        lyrics = [
          {
            title = "Verse 1";
            lyrics = [
              "Salve Regina, mater misericordiae",
              "Vita, dulcedo, et spes nostra, salve",
            ];
          },
        ];
        musicSheet = null;
      },
      {
        title = "O Come, O Come, Emmanuel";
        composer = "Catholic Hymn";
        category = #advent;
        lyrics = [
          {
            title = "Verse 1";
            lyrics = [
              "O come, O come, Emmanuel",
              "And ransom captive Israel",
              "That mourns in lonely exile here",
              "Until the Son of God appear",
            ];
          },
        ];
        musicSheet = null;
      },
      {
        title = "Christ the Lord Is Risen Today";
        composer = "Charles Wesley";
        category = #easter;
        lyrics = [
          {
            title = "Verse 1";
            lyrics = [
              "Christ the Lord is risen today",
              "Alleluia",
              "Sons of men and angels say",
              "Alleluia",
            ];
          },
        ];
        musicSheet = null;
      },
      {
        title = "Immaculate Mary";
        composer = "Catholic Hymn";
        category = #marian_hymns;
        lyrics = [
          {
            title = "Verse 1";
            lyrics = [
              "Immaculate Mary, your praises we sing",
              "You reign now with Jesus, our Savior and King",
            ];
          },
        ];
        musicSheet = null;
      },
      {
        title = "Pange Lingua";
        composer = "St. Thomas Aquinas";
        category = #mass_songs;
        lyrics = [
          {
            title = "Verse 1";
            lyrics = [
              "Pange lingua gloriosi",
              "Corporis mysterium",
              "Sanguinisque pretiosi",
              "Quem in mundi pretium",
            ];
          },
        ];
        musicSheet = null;
      },
      {
        title = "On Eagle's Wings";
        composer = "Michael Joncas";
        category = #general_devotion;
        lyrics = [
          {
            title = "Verse 1";
            lyrics = [
              "And He will raise you up on eagle's wings",
              "Bear you on the breath of dawn",
            ];
          },
        ];
        musicSheet = null;
      },
      {
        title = "Stabat Mater";
        composer = "Jacopone da Todi";
        category = #lent;
        lyrics = [
          {
            title = "Verse 1";
            lyrics = [
              "Stabat mater dolorosa",
              "Juxta crucem lacrimosa",
              "Dum pendebat Filius",
            ];
          },
        ];
        musicSheet = null;
      },
    ];

    for (songInput in seedSongs.values()) {
      let id = getNextId();
      let song : Song = {
        id;
        title = songInput.title;
        composer = songInput.composer;
        category = songInput.category;
        lyrics = songInput.lyrics;
        musicSheet = songInput.musicSheet;
        createdAt = Time.now();
        updatedAt = Time.now();
      };
      songs.add(id, song);
    };
  };

  // Seed songs on actor initialization
  system func preupgrade() {};
  system func postupgrade() {
    seedSongs();
  };
  seedSongs();
};
