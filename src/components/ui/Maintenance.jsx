export default function MaintenanceUIPage() {
  return (
    <div className="w-full max-w-md m-auto h-dvh min-h-72 text-center flex flex-col items-center justify-center">
      <img
        src="https://i.pinimg.com/736x/f3/8d/d4/f38dd4400921975b06f533fef78b6b04.jpg"
        width="100%"
        style={{ maxWidth: 200 }}
      />
      <h1 className="font-bold text-2xl">
        Uhh... we're currently performing maintenance
      </h1>
      <p className="mt-2 text-neutral-500">
        Please come back another time or check with the site owner for more
        information. Thank you!
      </p>
    </div>
  );
}
