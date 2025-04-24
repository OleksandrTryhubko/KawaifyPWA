interface GreetingProps {
  name?: string;
  withEmoji?: boolean;
  size?: "sm" | "md" | "lg";
}

const Greeting = ({ name, withEmoji = true, size = "lg" }: GreetingProps) => {
  const hour = new Date().getHours();

  let greeting = "";
  let emoji = "";

  if (hour < 5) {
    greeting = "Still awake?";
    emoji = "🌙";
  } else if (hour < 12) {
    greeting = "Good Morning";
    emoji = "☀️";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
    emoji = "🌤️";
  } else {
    greeting = "Good Evening";
    emoji = "🌙";
  }

  const headingSizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  return (
    <h1 className={`font-bold ${headingSizes[size]}`}>
      {greeting}
      {name && `, ${name}`}
      {withEmoji && ` ${emoji}`}
    </h1>
  );
};

export default Greeting;
