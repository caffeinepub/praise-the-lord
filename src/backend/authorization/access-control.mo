import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

module {
  public type UserRole = {
    #admin;
    #user;
    #guest;
  };

  public type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  public func initState() : AccessControlState {
    {
      var adminAssigned = false;
      userRoles = Map.empty<Principal, UserRole>();
    };
  };

  // Any principal that provides the correct admin token becomes admin.
  // This allows the real admin to reclaim access at any time.
  public func initialize(state : AccessControlState, caller : Principal, adminToken : Text, userProvidedToken : Text) {
    if (caller.isAnonymous()) { return };
    if (userProvidedToken == adminToken) {
      // Remove any previous admin and set this caller as admin
      state.userRoles.add(caller, #admin);
      state.adminAssigned := true;
    } else {
      switch (state.userRoles.get(caller)) {
        case (?_) {}; // already registered, keep role
        case (null) {
          state.userRoles.add(caller, #user);
        };
      };
    };
  };

  public func getUserRole(state : AccessControlState, caller : Principal) : UserRole {
    if (caller.isAnonymous()) { return #guest };
    switch (state.userRoles.get(caller)) {
      case (?role) { role };
      case (null) {
        Runtime.trap("User is not registered");
      };
    };
  };

  public func assignRole(state : AccessControlState, caller : Principal, user : Principal, role : UserRole) {
    if (not (isAdmin(state, caller))) {
      Runtime.trap("Unauthorized: Only admins can assign user roles");
    };
    state.userRoles.add(user, role);
  };

  public func hasPermission(state : AccessControlState, caller : Principal, requiredRole : UserRole) : Bool {
    if (caller.isAnonymous()) { return requiredRole == #guest };
    switch (state.userRoles.get(caller)) {
      case (?role) {
        if (role == #admin or requiredRole == #guest) { true } else {
          role == requiredRole;
        };
      };
      case (null) { false };
    };
  };

  public func isAdmin(state : AccessControlState, caller : Principal) : Bool {
    switch (state.userRoles.get(caller)) {
      case (?#admin) { true };
      case (_) { false };
    };
  };
};
