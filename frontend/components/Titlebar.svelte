<script>
    export let user;
    export let logged_in;
    export let isOnline;
    
    function logout(event) {
        event.preventDefault(); // Prevent refresh
        logged_in = false;
        user = null;
    }

</script>
<div class="titlebar">
    {#if logged_in}
        <div class="left-div">
            {#if !isOnline}
                <p>You are currently offline...</p>
            {/if}
        </div>
        <div class="right-div">
            <p>Welcome, {user.name}</p>
            <a href="#" on:click={logout}>Logout</a>
        </div>
    {/if}
</div>