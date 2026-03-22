import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

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

  type NewsPostId = Nat;

  type NewsPost = {
    id : NewsPostId;
    title : Text;
    body : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type NewsPostInput = {
    title : Text;
    body : Text;
  };

  module NewsPostUtils {
    public func compareByCreatedAt(post1 : NewsPost, post2 : NewsPost) : Order.Order {
      Int.compare(post2.createdAt, post1.createdAt);
    };
  };

  type DownloadItemId = Nat;

  type DownloadItem = {
    id : DownloadItemId;
    title : Text;
    description : Text;
    fileBlob : Storage.ExternalBlob;
    createdAt : Time.Time;
  };

  type DownloadItemInput = {
    title : Text;
    description : Text;
    fileBlob : Storage.ExternalBlob;
  };

  module DownloadItemUtils {
    public func compareByCreatedAt(item1 : DownloadItem, item2 : DownloadItem) : Order.Order {
      Int.compare(item2.createdAt, item1.createdAt);
    };
  };

  type MembershipId = Nat;

  type MembershipStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type MembershipApplication = {
    id : MembershipId;
    name : Text;
    email : Text;
    phone : Text;
    parish : Text;
    message : Text;
    status : MembershipStatus;
    submittedAt : Time.Time;
  };

  module MembershipApplication {
    public func toText(app : MembershipApplication) : Text {
      app.name;
    };

    public func compareBySubmissionTime(app1 : MembershipApplication, app2 : MembershipApplication) : Order.Order {
      Int.compare(app2.submittedAt, app1.submittedAt);
    };
  };

  type MembershipApplicationInput = {
    name : Text;
    email : Text;
    phone : Text;
    parish : Text;
    message : Text;
  };

  module MembershipApplicationInput {
    public func compare(x : MembershipApplicationInput, y : MembershipApplicationInput) : Order.Order {
      Text.compare(x.name, y.name);
    };
  };

  func isValidEmail(email : Text) : Bool {
    email.contains(#char '@');
  };

  let songs = Map.empty<SongId, Song>();
  var songIdCounter = 0;

  func getNextSongId() : SongId {
    let id = songIdCounter;
    songIdCounter += 1;
    id;
  };

  func getSongInternal(id : SongId) : Song {
    switch (songs.get(id)) {
      case (?song) { song };
      case (null) { Runtime.trap("Song with id " # id.toText() # " does not exist.") };
    };
  };

  let newsPosts = Map.empty<NewsPostId, NewsPost>();
  var newsPostIdCounter = 0;

  func getNextNewsPostId() : NewsPostId {
    let id = newsPostIdCounter;
    newsPostIdCounter += 1;
    id;
  };

  func getNewsPostInternal(id : NewsPostId) : NewsPost {
    switch (newsPosts.get(id)) {
      case (?newsPost) { newsPost };
      case (null) { Runtime.trap("News post with id " # id.toText() # " does not exist.") };
    };
  };

  let downloadItems = Map.empty<DownloadItemId, DownloadItem>();
  var downloadItemIdCounter = 0;

  func getNextDownloadItemId() : DownloadItemId {
    let id = downloadItemIdCounter;
    downloadItemIdCounter += 1;
    id;
  };

  func getDownloadItemInternal(id : DownloadItemId) : DownloadItem {
    switch (downloadItems.get(id)) {
      case (?downloadItem) { downloadItem };
      case (null) { Runtime.trap("Download item with id " # id.toText() # " does not exist.") };
    };
  };

  let membershipApplications = Map.empty<MembershipId, MembershipApplication>();
  var membershipIdCounter = 0;

  func getNextMembershipId() : MembershipId {
    let id = membershipIdCounter;
    membershipIdCounter += 1;
    id;
  };

  func getMembershipApplicationInternal(id : MembershipId) : MembershipApplication {
    switch (membershipApplications.get(id)) {
      case (?membership) { membership };
      case (null) { Runtime.trap("Membership application with id " # id.toText() # " does not exist.") };
    };
  };

  // Mixins for auth an blob logic
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // USER PROFILE MANAGEMENT

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // SONGS

  public shared ({ caller }) func addSong(songInput : SongInput) : async SongId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can create songs");
    };
    if (songInput.title.size() == 0) {
      Runtime.trap("Song should not have an empty title.");
    };
    let id = getNextSongId();
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
  public query func getSong(id : SongId) : async Song {
    getSongInternal(id);
  };

  // Get all songs (public)
  public query func getAllSongs() : async [Song] {
    songs.values().toArray().sort(SongUtils.compareByUpdatedAt);
  };

  // Search songs by title (public)
  public query func searchSongsByTitle(searchTerm : Text) : async [Song] {
    let lowerSearchTerm = searchTerm.toLower();
    songs.values().toArray().filter(func(s) { s.title.toLower().contains(#text lowerSearchTerm) });
  };

  // Get songs by category (public)
  public query func getSongsByCategory(category : Category.Type) : async [Song] {
    songs.values().toArray().filter(func(s) { s.category == category });
  };

  public query ({ caller }) func getByCategory() : async {
    mass_songs : [Song];
    marian_hymns : [Song];
    advent : [Song];
    lent : [Song];
    easter : [Song];
    general_devotion : [Song];
  } {
    let allSongs = songs.values().toArray();
    {
      mass_songs = allSongs.filter(func(song) { song.category == #mass_songs });
      marian_hymns = allSongs.filter(func(song) { song.category == #marian_hymns });
      advent = allSongs.filter(func(song) { song.category == #advent });
      lent = allSongs.filter(func(song) { song.category == #lent });
      easter = allSongs.filter(func(song) { song.category == #easter });
      general_devotion = allSongs.filter(func(song) { song.category == #general_devotion });
    };
  };

  // NEWS POSTS

  public shared ({ caller }) func addNewsPost(newsPostInput : NewsPostInput) : async NewsPostId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can create news posts");
    };
    if (newsPostInput.title.size() == 0) {
      Runtime.trap("News post title cannot be empty.");
    };
    if (newsPostInput.body.size() == 0) {
      Runtime.trap("News post body cannot be empty.");
    };
    let id = getNextNewsPostId();
    let newsPost : NewsPost = {
      id;
      title = newsPostInput.title;
      body = newsPostInput.body;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    newsPosts.add(id, newsPost);
    id;
  };

  public shared ({ caller }) func updateNewsPost(id : NewsPostId, newsPostInput : NewsPostInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update news posts");
    };
    if (newsPostInput.title.size() == 0) {
      Runtime.trap("News post title cannot be empty.");
    };
    if (newsPostInput.body.size() == 0) {
      Runtime.trap("News post body cannot be empty.");
    };
    let existingPost = getNewsPostInternal(id);
    let updatedPost : NewsPost = {
      id = existingPost.id;
      title = newsPostInput.title;
      body = newsPostInput.body;
      createdAt = existingPost.createdAt;
      updatedAt = Time.now();
    };
    newsPosts.add(id, updatedPost);
  };

  public shared ({ caller }) func deleteNewsPost(id : NewsPostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete news posts");
    };
    newsPosts.remove(id);
  };

  public query func getNewsPost(id : NewsPostId) : async NewsPost {
    getNewsPostInternal(id);
  };

  public query func getAllNewsPosts() : async [NewsPost] {
    newsPosts.values().toArray().sort(NewsPostUtils.compareByCreatedAt);
  };

  // DOWNLOAD ITEMS

  public shared ({ caller }) func addDownloadItem(downloadItemInput : DownloadItemInput) : async DownloadItemId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can create download items");
    };
    if (downloadItemInput.title.size() == 0) {
      Runtime.trap("Download item title cannot be empty.");
    };
    if (downloadItemInput.description.size() == 0) {
      Runtime.trap("Download item description cannot be empty.");
    };
    let id = getNextDownloadItemId();
    let downloadItem : DownloadItem = {
      id;
      title = downloadItemInput.title;
      description = downloadItemInput.description;
      fileBlob = downloadItemInput.fileBlob;
      createdAt = Time.now();
    };
    downloadItems.add(id, downloadItem);
    id;
  };

  public shared ({ caller }) func deleteDownloadItem(id : DownloadItemId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete download items");
    };
    downloadItems.remove(id);
  };

  public query func getDownloadItem(id : DownloadItemId) : async DownloadItem {
    getDownloadItemInternal(id);
  };

  public query func getAllDownloadItems() : async [DownloadItem] {
    downloadItems.values().toArray().sort(DownloadItemUtils.compareByCreatedAt);
  };

  // MEMBERSHIP APPLICATIONS

  public shared ({ caller }) func submitMembershipApplication(applicationInput : MembershipApplicationInput) : async MembershipId {
    if (applicationInput.name.size() == 0) {
      Runtime.trap("Name field must not be empty");
    };
    if (applicationInput.email.size() == 0) {
      Runtime.trap("Email field must not be empty");
    };
    if (not isValidEmail(applicationInput.email)) {
      Runtime.trap("Invalid email format. Please enter a valid email address.");
    };
    let id = getNextMembershipId();
    let application : MembershipApplication = {
      id;
      name = applicationInput.name;
      email = applicationInput.email;
      phone = applicationInput.phone;
      parish = applicationInput.parish;
      message = applicationInput.message;
      status = #pending;
      submittedAt = Time.now();
    };
    membershipApplications.add(id, application);
    id;
  };

  public shared ({ caller }) func approveMembershipApplication(id : MembershipId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can approve membership applications");
    };
    let existingApplication = getMembershipApplicationInternal(id);
    let updatedApplication = { existingApplication with status = #approved };
    membershipApplications.add(id, updatedApplication);
  };

  public shared ({ caller }) func rejectMembershipApplication(id : MembershipId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can reject membership applications");
    };
    let existingApplication = getMembershipApplicationInternal(id);
    let updatedApplication = { existingApplication with status = #rejected };
    membershipApplications.add(id, updatedApplication);
  };

  public shared ({ caller }) func deleteMembershipApplication(id : MembershipId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete membership applications");
    };
    membershipApplications.remove(id);
  };

  public query ({ caller }) func getAllMembershipApplications() : async [MembershipApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view membership applications");
    };
    membershipApplications.values().toArray().sort(MembershipApplication.compareBySubmissionTime);
  };

  public query ({ caller }) func searchMembershipApplications(searchTerm : Text) : async [MembershipApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can search membership applications");
    };
    let lowerSearchTerm = searchTerm.toLower();
    membershipApplications.values().toArray().filter(func(m) { m.name.toLower().contains(#text lowerSearchTerm) });
  };

  // DEVOTIONAL PRAYERS (READ-ONLY)

  type DevotionalPrayer = {
    id : Nat;
    title : Text;
    content : [Section];
  };

  type Prayer = {
    id : Nat;
    title : Text;
    prayer : Text;
    requestor : Text;
    requestorEmail : Text;
    submittedAt : Time.Time;
  };

  let prayers = Map.empty<Nat, Prayer>();
  var prayerIdCounter = 0;

  func getNextPrayerId() : Nat {
    let id = prayerIdCounter;
    prayerIdCounter += 1;
    id;
  };

  let devotionalPrayers : [DevotionalPrayer] = [
    {
      id = 1;
      title = "Our Father (The Lord's Prayer)";
      content = [
        {
          title = "";
          lyrics = [
            "Our Father, who art in heaven,",
            "Hallowed be thy Name.",
            "Thy kingdom come.",
            "Thy will be done on earth,",
            "As it is in heaven.",
            "Give us this day our daily bread.",
            "And forgive us our trespasses,",
            "As we forgive those who trespass against us.",
            "And lead us not into temptation,",
            "But deliver us from evil.",
            "Amen.",
          ];
        },
      ];
    },
    {
      id = 2;
      title = "Hail Mary";
      content = [
        {
          title = "";
          lyrics = [
            "Hail Mary, full of grace,",
            "the Lord is with thee.",
            "Blessed art thou among women",
            "And blessed is the fruit of thy womb, Jesus.",
            "Holy Mary, Mother of God,",
            "Pray for us sinners, now and",
            "At the hour of our death.",
            "Amen.",
          ];
        },
      ];
    },
    {
      id = 3;
      title = "Glory Be (Doxology)";
      content = [
        {
          title = "";
          lyrics = [
            "Glory be to the Father,",
            "And to the Son,",
            "And to the Holy Spirit.",
            "As it was in the beginning,",
            "Is now, and ever shall be,",
            "World without end.",
            "Amen.",
          ];
        },
      ];
    },
    {
      id = 4;
      title = "The Apostles' Creed";
      content = [
        {
          title = "";
          lyrics = [
            "I believe in God, the Father Almighty,",
            "Creator of heaven and earth.",
            "I believe in Jesus Christ, his only Son, our Lord.",
            "He was conceived by the Holy Spirit,",
            "And was born of the Virgin Mary.",
            "He suffered under Pontius Pilate,",
            "Was crucified, died, and was buried.",
            "He descended to the dead.",
            "On the third day he rose again.",
            "He ascended into heaven,",
            "And is seated at the right hand of the Father.",
            "He will come again to judge the living and the dead.",
            "I believe in the Holy Spirit,",
            "The holy catholic Church,",
            "The communion of saints,",
            "The forgiveness of sins,",
            "The resurrection of the body,",
            "And life everlasting.",
            "Amen.",
          ];
        },
      ];
    },
    {
      id = 5;
      title = "Act of Contrition";
      content = [
        {
          title = "";
          lyrics = [
            "O my God, I am heartily sorry",
            "For having offended thee,",
            "And I detest all my sins,",
            "Because I dread the loss of heaven and the pains of hell;",
            "But most of all because they offend thee, my God,",
            "Who art all-good and deserving of all my love.",
            "I firmly resolve, with the help of thy grace,",
            "To confess my sins, to do penance, and to amend my life.",
            "Amen.",
          ];
        },
      ];
    },
    {
      id = 6;
      title = "Prayer to St. Michael the Archangel";
      content = [
        {
          title = "";
          lyrics = [
            "St. Michael the Archangel, defend us in battle.",
            "Be our protection against the wickedness and snares of the devil.",
            "May God rebuke him, we humbly pray;",
            "And do thou, O Prince of the heavenly host,",
            "By the power of God, cast into hell Satan and all the evil spirits",
            "Who prowl about the world seeking the ruin of souls.",
            "Amen.",
          ];
        },
      ];
    },
    {
      id = 7;
      title = "Hail, Holy Queen (Salve Regina)";
      content = [
        {
          title = "";
          lyrics = [
            "Hail, Holy Queen, Mother of Mercy,",
            "Our life, our sweetness, and our hope.",
            "To thee do we cry, poor banished children of Eve,",
            "To thee do we send up our sighs,",
            "Mourning and weeping in this valley of tears.",
            "Turn then, most gracious advocate,",
            "Thine eyes of mercy toward us.",
            "And after this, our exile,",
            "Show unto us the blessed fruit of thy womb, Jesus.",
            "O clement, O loving, O sweet Virgin Mary.",
            "Pray for us, O holy Mother of God,",
            "That we may be made worthy of the promises of Christ.",
            "Amen.",
          ];
        },
      ];
    },
    {
      id = 8;
      title = "The Memorare";
      content = [
        {
          title = "";
          lyrics = [
            "Remember, O most gracious Virgin Mary,",
            "That never was it known that anyone",
            "Who fled to thy protection,",
            "Implored thy help, or sought thy intercession,",
            "Was left unaided.",
            "Inspired by this confidence, I fly unto thee,",
            "O Virgin of virgins, my Mother.",
            "To thee do I come, before thee I stand,",
            "Sinful and sorrowful.",
            "O Mother of the Word Incarnate,",
            "Despise not my petitions,",
            "But in thy mercy hear and answer me.",
            "Amen.",
          ];
        },
      ];
    },
    {
      id = 9;
      title = "Prayer for Peace (Prayer of St. Francis)";
      content = [
        {
          title = "";
          lyrics = [
            "Lord, make me an instrument of your peace.",
            "Where there is hatred, let me sow love;",
            "Where there is injury, pardon;",
            "Where there is doubt, faith;",
            "Where there is despair, hope;",
            "Where there is darkness, light;",
            "And where there is sadness, joy.",
            "O Divine Master, grant that I may not so much seek",
            "To be consoled as to console;",
            "To be understood as to understand;",
            "To be loved as to love.",
            "For it is in giving that we receive;",
            "It is in pardoning that we are pardoned;",
            "And it is in dying that we are born to eternal life.",
            "Amen.",
          ];
        },
      ];
    },
    {
      id = 10;
      title = "Guardian Angel Prayer";
      content = [
        {
          title = "";
          lyrics = [
            "Angel of God, my guardian dear,",
            "To whom God's love commits me here,",
            "Ever this day, be at my side,",
            "To light and guard, to rule and guide.",
            "Amen.",
          ];
        },
      ];
    },
  ];

  public query func getAllDevotionalPrayers() : async [DevotionalPrayer] {
    devotionalPrayers;
  };

  public query func getDevotionalPrayer(id : Nat) : async DevotionalPrayer {
    switch (devotionalPrayers.find(func(prayer) { prayer.id == id })) {
      case (?prayer) { prayer };
      case (null) { Runtime.trap("Prayer not found") };
    };
  };

  public query func searchDevotionalPrayers(searchTerm : Text) : async [DevotionalPrayer] {
    let lowerSearchTerm = searchTerm.toLower();
    devotionalPrayers.filter(func(p) { p.title.toLower().contains(#text lowerSearchTerm) });
  };

  system func preupgrade() {};
  system func postupgrade() {};
};
